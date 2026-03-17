import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// 动态导入 xlsx，因为它是一个客户端库，但在服务器端使用时需要特殊处理
type XLSXModule = typeof import('xlsx');
let XLSX: XLSXModule | null = null;

async function initXLSX() {
  if (!XLSX) {
    const mod = await import('xlsx');
    const maybeDefault = (mod as unknown as { default?: XLSXModule }).default;
    XLSX = maybeDefault ?? (mod as unknown as XLSXModule);
  }
  return XLSX;
}

export async function POST() {
  try {
    // 验证用户权限
    const authResult = await verifyAuth();
    if (!authResult.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 初始化 xlsx
    const xlsx = await initXLSX();

    // 创建工作簿
    const workbook = xlsx.utils.book_new();

    // Sheet 1: 产品数据模板
    const productTemplate: Array<Record<string, string>> = [
      {
        '产品名称': '示例产品 1',
        '产品描述': '这是一个示例产品描述',
        '价格': '99.99',
        '库存': '100',
        '分类': '珠宝',
        '主图片': 'main-image.jpg',
        '其他图片': 'image2.jpg,image3.jpg',
        'SKU': 'SKU-001',
        '状态': '发布',
      },
      {
        '产品名称': '示例产品 2',
        '产品描述': '另一个示例产品描述',
        '价格': '149.99',
        '库存': '50',
        '分类': '项链',
        '主图片': 'main-image2.jpg',
        '其他图片': 'image4.jpg',
        'SKU': 'SKU-002',
        '状态': '发布',
      },
    ];

    const productSheet = xlsx.utils.json_to_sheet(productTemplate);

    // 设置列宽
    productSheet['!cols'] = [
      { wch: 15 }, // 产品名称
      { wch: 25 }, // 产品描述
      { wch: 12 }, // 价格
      { wch: 10 }, // 库存
      { wch: 12 }, // 分类
      { wch: 18 }, // 主图片
      { wch: 20 }, // 其他图片
      { wch: 12 }, // SKU
      { wch: 10 }, // 状态
    ];

    xlsx.utils.book_append_sheet(workbook, productSheet, '产品数据');

    // Sheet 2: 说明文档
    const instructionData: Array<Record<string, string>> = [
      { 字段: '产品名称', 必填: '是', 说明: '产品的名称，长度 1-100 字符' },
      { 字段: '产品描述', 必填: '否', 说明: '产品的详细描述' },
      { 字段: '价格', 必填: '是', 说明: '产品价格，支持两位小数' },
      { 字段: '库存', 必填: '是', 说明: '库存数量，必须为正整数' },
      { 字段: '分类', 必填: '是', 说明: '产品分类，如：珠宝、项链、手镯等' },
      { 字段: '主图片', 必填: '否', 说明: '主图片文件名（必须包含在 images 文件夹中）' },
      { 字段: '其他图片', 必填: '否', 说明: '其他图片，多个文件用逗号分隔' },
      { 字段: 'SKU', 必填: '否', 说明: '产品 SKU 编码' },
      { 字段: '状态', 必填: '否', 说明: '发布状态：发布 或 草稿（默认为发布）' },
    ];

    const instructionSheet = xlsx.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { wch: 15 },
      { wch: 8 },
      { wch: 40 },
    ];

    xlsx.utils.book_append_sheet(workbook, instructionSheet, '字段说明');

    // 生成 Excel 文件
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // 返回文件
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="product-import-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('生成模板失败:', error);
    return NextResponse.json(
      { error: '生成模板失败' },
      { status: 500 }
    );
  }
}
