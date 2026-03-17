import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

type XLSXModule = typeof import('xlsx');
let XLSX: XLSXModule | null = null;

async function initXLSX() {
  if (!XLSX) {
    // dynamic import to keep startup small and satisfy ESM environments
    const mod = await import('xlsx');
    const maybeDefault = (mod as unknown as { default?: XLSXModule }).default;
    XLSX = maybeDefault ?? (mod as unknown as XLSXModule);
  }
  return XLSX;
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

    // 初始化 xlsx
    const xlsx = await initXLSX();

    // 读取文件内容
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'array' });

    if (!workbook.SheetNames.length) {
      return NextResponse.json(
        { error: 'Excel 文件为空' },
        { status: 400 }
      );
    }

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为 JSON
    const sheetToJson = (xlsx.utils.sheet_to_json as unknown as (ws: unknown) => Array<Record<string, unknown>>);
    const data = sheetToJson(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Excel 文件中没有数据' },
        { status: 400 }
      );
    }

    // 验证数据
    type ValidationIssue = { row: number; field: string; message: string };
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // 必填字段
    const requiredFields = ['产品名称', '价格', '库存', '分类'];

    data.forEach((row: Record<string, unknown>, index: number) => {
      const rowNumber = index + 2; // Excel 行号（从第2行开始，因为第1行是标题）

      // 检查必填字段
      requiredFields.forEach((field) => {
        const val = row[field];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '')
        ) {
          errors.push({
            row: rowNumber,
            field,
            message: `${field} 不能为空`,
          });
        }
      });

      // 验证价格格式
      if (row['价格'] !== undefined && row['价格'] !== null) {
        const raw = row['价格'];
        const price = typeof raw === 'number' ? raw : parseFloat(String(raw));
        if (Number.isNaN(price) || price < 0) {
          errors.push({ row: rowNumber, field: '价格', message: '价格必须是正数' });
        }
      }

      // 验证库存格式
      if (row['库存'] !== undefined && row['库存'] !== null) {
        const raw = row['库存'];
        const stock = typeof raw === 'number' ? Math.trunc(raw) : parseInt(String(raw), 10);
        if (Number.isNaN(stock) || stock < 0) {
          errors.push({ row: rowNumber, field: '库存', message: '库存必须是正整数' });
        }
      }

      // 验证产品名称长度
      const name = row['产品名称'];
      if (typeof name === 'string' && name.length > 100) {
        warnings.push({ row: rowNumber, field: '产品名称', message: '产品名称过长，建议不超过 100 字符' });
      }
    });

    // 返回验证结果
    return NextResponse.json({
      valid: errors.length === 0,
      totalRows: data.length,
      errors,
      warnings,
    });
  } catch (error) {
    console.error('验证 Excel 失败:', error);
    return NextResponse.json(
      { error: '验证 Excel 失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
