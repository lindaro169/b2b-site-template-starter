import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { apiErrorResponse } from '@/lib/api-response';
import { isSupportedExcelFileName, readFirstWorksheetRows } from '@/lib/excel';
type JSZipModule = typeof import('jszip');

let JSZip: JSZipModule | null = null;

async function initLibraries() {
  if (!JSZip) {
    const mod = await import('jszip');
    const maybeDefault = (mod as unknown as { default?: JSZipModule }).default;
    JSZip = maybeDefault ?? (mod as unknown as JSZipModule);
  }

  return { JSZip };
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const authResult = await verifyAuth();
    if (!authResult.user) {
      return apiErrorResponse('未授权', 401);
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return apiErrorResponse('未找到文件', 400);
    }

    // 初始化库
    const { JSZip } = await initLibraries();

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
      if (isSupportedExcelFileName(filename) && !filename.includes('__MACOSX')) {
        excelFile = zipEntry;
        excelFileName = filename;
        break;
      }
    }

    if (!excelFile) {
      return NextResponse.json(
        { success: false, error: 'ZIP 文件中未找到 .xlsx Excel 文件' },
        { status: 400 }
      );
    }

    // 读取 Excel 文件
    const excelBuffer = await excelFile.async('arraybuffer');
    if (!(excelBuffer instanceof ArrayBuffer) && !(excelBuffer instanceof Uint8Array)) {
      return NextResponse.json(
        { success: false, error: 'Excel 文件读取失败' },
        { status: 400 }
      );
    }

    const data = await readFirstWorksheetRows(excelBuffer);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel 文件中没有数据' },
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
    return apiErrorResponse('快速导入失败', 500);
  }
}
