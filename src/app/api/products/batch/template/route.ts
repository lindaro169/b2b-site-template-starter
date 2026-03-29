import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createWorkbookBuffer, type ExcelSheetDefinition } from '@/lib/excel';

export async function POST() {
  try {
    // 验证用户权限
    const authResult = await verifyAuth();
    if (!authResult.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

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

    const sheets: ExcelSheetDefinition[] = [
      {
        name: '产品数据',
        columns: [
          { header: '产品名称', key: '产品名称', width: 15 },
          { header: '产品描述', key: '产品描述', width: 25 },
          { header: '价格', key: '价格', width: 12 },
          { header: '库存', key: '库存', width: 10 },
          { header: '分类', key: '分类', width: 12 },
          { header: '主图片', key: '主图片', width: 18 },
          { header: '其他图片', key: '其他图片', width: 20 },
          { header: 'SKU', key: 'SKU', width: 12 },
          { header: '状态', key: '状态', width: 10 },
        ],
        rows: productTemplate,
      },
      {
        name: '字段说明',
        columns: [
          { header: '字段', key: '字段', width: 15 },
          { header: '必填', key: '必填', width: 8 },
          { header: '说明', key: '说明', width: 40 },
        ],
        rows: instructionData,
      },
    ];

    const buffer = await createWorkbookBuffer(sheets);

    // 返回文件
    return new NextResponse(new Uint8Array(buffer), {
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
