/**
 * POST /api/upload
 * 文件上传端点 (需要认证)
 *
 * 支持上传：
 * - 产品图片
 * - 博客文章图片
 * - 用户头像
 *
 * 使用 Cloudflare R2 存储
 *
 * 请求：
 * - multipart/form-data
 * - file: 要上传的文件
 * - type: 上传类型 (product|blog|avatar)
 * - id: 相关的资源 ID (可选)
 *
 * 响应 (200):
 * {
 *   success: true
 *   url: "https://assets.template-site-placeholder.example/...",
 *   key: "products/...",
 *   size: 1024000
 * }
 *
 * 错误 (4xx, 5xx):
 * {
 *   success: false
 *   error: "错误描述"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { verifyAuth } from '@/lib/auth';
import { siteConfig } from '@/lib/site-config';
import {
  uploadProductImage,
  uploadBlogImage,
  uploadAvatar,
  uploadFile,
  type R2Bucket,
} from '@/lib/r2-storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
type UploadEnv = {
  R2?: R2Bucket;
  R2_BUCKET?: R2Bucket;
};

export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    // 1. 认证检查
    let session = await verifyAuth();

    // ✅ 开发环境允许绕过认证 (用于脚本批量导入)
    if (!session && process.env.NODE_ENV === 'development' && request.headers.get('x-bypass-auth') === 'true') {
      console.log('⚠️ 开发环境：绕过认证检查');
      session = {
        user: {
          id: 'dev-script',
          email: 'dev@local',
          name: 'Dev Script',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        session: { id: 'dev-session', userId: 'dev-script', expiresAt: new Date(), token: 'dev', createdAt: new Date(), updatedAt: new Date(), ipAddress: '127.0.0.1' }
      };
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 2. 解析 multipart 表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string;
    const resourceId = formData.get('id') as string;

    // 3. 验证输入
    if (!file) {
      return NextResponse.json(
        { success: false, error: '缺少文件' },
        { status: 400 }
      );
    }

    if (!uploadType) {
      return NextResponse.json(
        { success: false, error: '缺少上传类型' },
        { status: 400 }
      );
    }

    if (!['product', 'blog', 'avatar'].includes(uploadType)) {
      return NextResponse.json(
        { success: false, error: '无效的上传类型' },
        { status: 400 }
      );
    }

    // 4. 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `文件大小超过限制 (最大 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
        },
        { status: 400 }
      );
    }

    // 5. 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: '不支持的文件类型。仅支持：JPEG, PNG, GIF, WebP, SVG',
        },
        { status: 400 }
      );
    }

    // 6. 转换文件为 Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 7. 获取 R2 桶
    // 注意：使用 OpenNextJS Cloudflare 提供的特有上下文以防本地失效
    let bucket: R2Bucket | undefined;
    try {
      const { env } = await getCloudflareContext();
      bucket = (env as UploadEnv).R2 || (env as UploadEnv).R2_BUCKET;
    } catch {
      const requestWithEnv = request as NextRequest & { env?: UploadEnv };
      bucket = requestWithEnv.env?.R2 || requestWithEnv.env?.R2_BUCKET;
    }

    if (!bucket) {
      console.warn('⚠️ R2 存储不可用，返回模拟 URL');

      // 返回模拟的 URL（用于本地开发）
      const mockKey = `${uploadType}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${file.name.split('.').pop()}`;
      const mockUrl = `https://${siteConfig.assetHost}/mock/${mockKey}`;

      return NextResponse.json(
        {
          success: true,
          url: mockUrl,
          key: mockKey,
          size: file.size,
          note: '模拟 URL（R2 未配置）',
        },
        { status: 200 }
      );
    }

    // 8. 上传文件到 R2
    const exactKey = formData.get('exactKey') as string | null;
    let uploadResult;

    if (exactKey && process.env.NODE_ENV === 'development') {
      uploadResult = await uploadFile({
        bucket,
        file: buffer,
        fileName: file.name,
        exactKey,
        metadata: { type: uploadType }
      });
    } else {
      switch (uploadType) {
        case 'product':
          uploadResult = await uploadProductImage(
            bucket,
            buffer,
            file.name,
            resourceId ? parseInt(resourceId) : undefined
          );
          break;

        case 'blog':
          uploadResult = await uploadBlogImage(
            bucket,
            buffer,
            file.name,
            resourceId ? parseInt(resourceId) : undefined
          );
          break;

        case 'avatar':
          uploadResult = await uploadAvatar(bucket, buffer, file.name, resourceId);
          break;

        default:
          return NextResponse.json(
            { success: false, error: '未知的上传类型' },
            { status: 400 }
          );
      }
    }

    if (!uploadResult.success) {
      console.error('上传失败:', uploadResult.error);
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error || '文件上传失败',
        },
        { status: 500 }
      );
    }

    // 9. 记录上传日志
    console.info('文件上传成功', {
      userId: session.user.id,
      fileName: file.name,
      type: uploadType,
      size: file.size,
      url: uploadResult.url,
      timestamp: new Date().toISOString(),
    });

    // 10. 返回成功响应
    return NextResponse.json(
      {
        success: true,
        url: uploadResult.url,
        key: uploadResult.key,
        size: uploadResult.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('文件上传错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '文件上传失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 处理 OPTIONS 请求（用于 CORS 预检）
 */
export async function OPTIONS() {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
