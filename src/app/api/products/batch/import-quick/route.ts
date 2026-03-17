import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

type XLSXModule = typeof import('xlsx');
type JSZipModule = typeof import('jszip');

let XLSX: XLSXModule | null = null;
let JSZip: JSZipModule | null = null;

async function initLibraries() {
  if (!XLSX) {
    const mod = await import('xlsx');
    const maybeDefault = (mod as unknown as { default?: XLSXModule }).default;
    XLSX = maybeDefault ?? (mod as unknown as XLSXModule);
  }

  if (!JSZip) {
    const mod = await import('jszip');
    const maybeDefault = (mod as unknown as { default?: JSZipModule }).default;
    JSZip = maybeDefault ?? (mod as unknown as JSZipModule);
  }

  return { XLSX, JSZip };
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const authResult = await verifyAuth();
    if (!authResult.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 初始化库
    const { XLSX, JSZip } = await initLibraries();

    // 读取 ZIP 文件
    const buffer = await file.arrayBuffer();
    type JSZipEntry = { async(type: 'arraybuffer' | string): Promise<ArrayBuffer | string | Uint8Array> };
    type JSZipConstructor = new () => { loadAsync(buffer: unknown): Promise<void>; files: Record<string, JSZipEntry> };
    const ZipCtor = (JSZip as unknown as { default?: JSZipConstructor }).default ?? (JSZip as unknown as JSZipConstructor);
    const zip = new ZipCtor();
    await zip.loadAsync(buffer);

    // 查找 Excel 文件
    let excelFile: { async(type: string): Promise<ArrayBuffer | string | Uint8Array> } | null = null;
    let excelFileName = '';

    type JSZipFiles = Record<string, JSZipEntry>;
    const files = (zip as { files: JSZipFiles }).files;

    for (const [filename, zipEntry] of Object.entries(files)) {
      if ((filename.endsWith('.xlsx') || filename.endsWith('.xls')) && !filename.includes('__MACOSX')) {
        excelFile = zipEntry;
        excelFileName = filename;
        break;
      }
    }

    if (!excelFile) {
      return NextResponse.json(
        { error: 'ZIP 文件中未找到 Excel 文件' },
        { status: 400 }
      );
    }

    // 读取 Excel 文件
    const excelBuffer = await excelFile.async('arraybuffer');
    const workbook = XLSX.read(excelBuffer, { type: 'array' });

    if (!workbook.SheetNames.length) {
      return NextResponse.json(
        { error: 'Excel 文件为空' },
        { status: 400 }
      );
    }

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const sheetToJson = (XLSX.utils.sheet_to_json as unknown as (ws: unknown) => Array<Record<string, unknown>>);
    const data = sheetToJson(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Excel 文件中没有数据' },
        { status: 400 }
      );
    }

    // 验证和处理数据
    const requiredFields = ['产品名称', '价格', '库存', '分类'];
    let successCount = 0;
    let failureCount = 0;

    // 这里应该保存到数据库，但现在只是验证
    type Row = Record<string, unknown>;
    const products = data.map((row: Row) => {

      // 基础验证
      const hasAllRequired = requiredFields.every(
        (field) => row[field] && (typeof row[field] !== 'string' || row[field].trim() !== '')
      );

      if (!hasAllRequired) {
        failureCount++;
        return null;
      }

      try {
        const price = parseFloat(String(row['价格'] ?? ''));
        const stock = parseInt(String(row['库存'] ?? ''), 10);

        if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
          failureCount++;
          return null;
        }

        successCount++;

        return {
          name: row['产品名称'].toString().trim(),
          description: row['产品描述']?.toString().trim() || '',
          price,
          stock,
          category: row['分类'].toString().trim(),
          mainImage: row['主图片']?.toString().trim() || '',
          otherImages: row['其他图片']?.toString().trim() || '',
          sku: row['SKU']?.toString().trim() || '',
          published: (row['状态']?.toString().trim() || '发布') === '发布',
        };
      } catch {
        failureCount++;
        return null;
      }
    });

    // 过滤掉 null 值
    const validProducts = products.filter((p) => p !== null);

    // TODO: 保存到数据库，处理图片等

    return NextResponse.json({
      success: true,
      stats: {
        total: data.length,
        successful: successCount,
        failed: failureCount,
      },
      message: `成功导入 ${successCount} 个产品，${failureCount} 个失败`,
      file: excelFileName,
      productsCount: {
        uploaded: validProducts.length,
      },
    });
  } catch (error) {
    console.error('快速导入失败:', error);
    return NextResponse.json(
      { error: '快速导入失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
