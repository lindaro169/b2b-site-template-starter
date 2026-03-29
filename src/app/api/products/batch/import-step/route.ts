import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { apiErrorResponse } from '@/lib/api-response';
import { isSupportedExcelFileName, readFirstWorksheetRows } from '@/lib/excel';

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const authResult = await verifyAuth();
    if (!authResult.user) {
      return apiErrorResponse('未授权', 401);
    }

    // 获取上传的文件
    const formData = await request.formData();
    const excelFile = formData.get('excelFile') as File;
    const imageFiles = formData.getAll('images') as File[];

    if (!excelFile) {
      return apiErrorResponse('未找到 Excel 文件', 400);
    }

    if (!isSupportedExcelFileName(excelFile.name)) {
      return apiErrorResponse('只支持 .xlsx 格式的 Excel 文件', 400);
    }

    // 读取 Excel 文件
    const data = await readFirstWorksheetRows(await excelFile.arrayBuffer());

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel 文件中没有数据' },
        { status: 400 }
      );
    }

    // 处理图片文件
    const imageMap = new Map<string, File>();
    imageFiles.forEach((file) => {
      const filename = file.name.toLowerCase();
      imageMap.set(filename, file);
    });

    // 验证和处理数据
    const requiredFields = ['产品名称', '价格', '库存', '分类'];
    let successCount = 0;
    let failureCount = 0;

    type Row = Record<string, unknown>;
    type ProductResult = {
      name: string;
      description: string;
      price: number;
      stock: number;
      category: string;
      mainImage: string;
      otherImages: string;
      sku: string;
      published: boolean;
    };

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

        // 尝试查找主图片
        const mainImageName = row['主图片']?.toString().trim() || '';
        const mainImageFile = mainImageName ? imageMap.get(mainImageName.toLowerCase()) : null;

        // 处理其他图片
        const otherImagesStr = String(row['其他图片'] ?? '').trim() || '';
        const otherImageFiles = otherImagesStr
          ? otherImagesStr
            .split(',')
            .map((name: string) => {
              const trimmed = name.trim().toLowerCase();
              return imageMap.get(trimmed);
            })
            .filter((v): v is File => Boolean(v))
          : [];

        return {
          name: row['产品名称'].toString().trim(),
          description: row['产品描述']?.toString().trim() || '',
          price,
          stock,
          category: row['分类'].toString().trim(),
          mainImage: mainImageFile?.name || '',
          otherImages: otherImageFiles.map((f: File) => f.name).join(','),
          sku: row['SKU']?.toString().trim() || '',
          published: (row['状态']?.toString().trim() || '发布') === '发布',
        };
      } catch {
        failureCount++;
        return null;
      }
    });

    // 过滤掉 null 值，保留类型信息
    const validProducts = products.filter((p): p is ProductResult => p !== null);

    // TODO: 保存到数据库，处理图片上传等

    return NextResponse.json({
      success: true,
      stats: {
        total: data.length,
        successful: successCount,
        failed: failureCount,
      },
      message: `成功导入 ${successCount} 个产品，${failureCount} 个失败`,
      productsCount: {
        uploaded: validProducts.length,
        withImages: validProducts.filter((p): p is ProductResult => (p as ProductResult).mainImage !== undefined || (p as ProductResult).otherImages !== undefined).length,
      },
    });
  } catch (error) {
    console.error('分步导入失败:', error);
    return apiErrorResponse('分步导入失败', 500);
  }
}
