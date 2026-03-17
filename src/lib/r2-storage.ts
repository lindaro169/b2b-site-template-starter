/**
 * Cloudflare R2 文件存储集成
 *
 * 提供文件上传和管理功能：
 * - 产品图片上传
 * - 博客文章图片
 * - 用户头像
 * - 文件删除
 * - URL 生成
 *
 * Cloudflare R2: https://developers.cloudflare.com/r2/
 * 免费额度：10GB 存储空间/月
 */

export interface R2PutOptions {
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}

export interface R2PutResult {
  size?: number;
  uploaded?: string;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
  // body may be present when copying/reading
  body?: unknown;
}

export interface R2GetResult {
  size?: number;
  uploaded?: string;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
  body?: unknown;
}

export interface R2Object {
  key: string;
  size?: number;
  uploaded?: string;
}

export interface R2ListResult {
  objects?: R2Object[];
}

export interface R2Bucket {
  put(key: string, value: Buffer | Blob | ReadableStream<Uint8Array>, options?: R2PutOptions): Promise<R2PutResult | null>;
  get(key: string): Promise<R2GetResult | null>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<R2ListResult>;
}

export interface UploadOptions {
  bucket: R2Bucket;
  file: Buffer | Blob | ReadableStream<Uint8Array>;
  fileName: string;
  contentType?: string;
  metadata?: Record<string, string>;
  exactKey?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  size?: number;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

const PUBLIC_URL_BASE = 'https://assets.crystalconnect.com';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 生成唯一的文件名
 */
function generateFileName(originalFileName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = originalFileName.split('.').pop() || 'bin';
  return `${timestamp}-${randomStr}.${ext}`;
}

/**
 * 获取文件类型
 */
function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    txt: 'text/plain',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * 验证文件
 */
function validateFile(file: Buffer | Blob | ReadableStream<Uint8Array>, fileName: string): {
  valid: boolean;
  error?: string;
} {
  // 检查文件扩展名
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf'];
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${ext || 'unknown'}。仅支持: ${allowedExtensions.join(', ')}`,
    };
  }

  // 检查文件大小（仅适用于 Buffer）
  if (Buffer.isBuffer(file)) {
    if (file.length > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `文件大小超过限制 (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      };
    }
  }

  return { valid: true };
}

/**
 * 上传文件到 R2
 */
export async function uploadFile(
  options: UploadOptions & { folder?: string }
): Promise<UploadResult> {
  try {
    // 验证文件
    const validation = validateFile(options.file, options.fileName);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 生成文件名
    const generatedFileName = generateFileName(options.fileName);
    const folder = options.folder || 'uploads';
    const key = options.exactKey || `${folder}/${generatedFileName}`;

    // 获取内容类型
    const contentType = options.contentType || getContentType(options.fileName);

    // 上传文件
    const uploadResponse = await options.bucket.put(key, options.file, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        originalName: options.fileName,
        uploadedAt: new Date().toISOString(),
        ...options.metadata,
      },
    });

    if (!uploadResponse) {
      return {
        success: false,
        error: '文件上传失败',
      };
    }

    // 生成公开 URL
    const url = `${PUBLIC_URL_BASE}/${key}`;

    // 记录上传日志
    console.info('文件已上传', {
      key,
      fileName: options.fileName,
      size: uploadResponse?.size,
      url,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      url,
      key,
      size: uploadResponse?.size,
    };
  } catch (error) {
    console.error('文件上传错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件上传失败',
    };
  }
}

/**
 * 上传产品图片
 */
export async function uploadProductImage(
  bucket: R2Bucket,
  file: Buffer | Blob,
  fileName: string,
  productId?: number
): Promise<UploadResult> {
  return uploadFile({
    bucket,
    file,
    fileName,
    folder: 'products',
    metadata: {
      type: 'product-image',
      productId: productId?.toString(),
    },
  });
}

/**
 * 上传博客图片
 */
export async function uploadBlogImage(
  bucket: R2Bucket,
  file: Buffer | Blob,
  fileName: string,
  postId?: number
): Promise<UploadResult> {
  return uploadFile({
    bucket,
    file,
    fileName,
    folder: 'blog',
    metadata: {
      type: 'blog-image',
      postId: postId?.toString(),
    },
  });
}

/**
 * 上传用户头像
 */
export async function uploadAvatar(
  bucket: R2Bucket,
  file: Buffer | Blob,
  fileName: string,
  userId?: string
): Promise<UploadResult> {
  return uploadFile({
    bucket,
    file,
    fileName,
    folder: 'avatars',
    metadata: {
      type: 'avatar',
      userId,
    },
  });
}

/**
 * 删除文件
 */
export async function deleteFile(bucket: R2Bucket, key: string): Promise<DeleteResult> {
  try {
    await bucket.delete(key);

    console.info('文件已删除', {
      key,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('文件删除错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件删除失败',
    };
  }
}

/**
 * 生成公开 URL
 */
export function generatePublicUrl(key: string): string {
  return `${PUBLIC_URL_BASE}/${key}`;
}

/**
 * 列出文件夹中的文件
 */
export async function listFiles(
  bucket: R2Bucket,
  folder: string,
  prefix?: string
): Promise<{
  success: boolean;
  files?: Array<{ key: string; size?: number; lastModified?: Date }>;
  error?: string;
}> {
  try {
    const listKey = prefix ? `${folder}/${prefix}` : folder;
    const response = await bucket.list({ prefix: listKey });

    if (!response.objects) {
      return { success: true, files: [] };
    }

    const files = response.objects.map((obj: R2Object) => ({
      key: obj.key,
      size: obj.size,
      lastModified: new Date(obj.uploaded as string),
    }));

    return { success: true, files };
  } catch (error) {
    console.error('列出文件错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '列出文件失败',
    };
  }
}

/**
 * 从 URL 路径获取存储键
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname.substring(1); // 移除开头的 /
    return path;
  } catch {
    return null;
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(bucket: R2Bucket, key: string): Promise<boolean> {
  try {
    const file = await bucket.get(key);
    return !!file;
  } catch {
    return false;
  }
}

/**
 * 获取文件信息
 */
export async function getFileInfo(
  bucket: R2Bucket,
  key: string
): Promise<{
  success: boolean;
  info?: {
    key: string;
    size?: number;
    contentType?: string;
    lastModified?: Date;
  };
  error?: string;
}> {
  try {
    const file = await bucket.get(key);

    if (!file) {
      return {
        success: false,
        error: '文件不存在',
      };
    }

    return {
      success: true,
      info: {
        key,
        size: file.size,
        contentType: file.httpMetadata?.contentType,
        lastModified: new Date(file.uploaded),
      },
    };
  } catch (error) {
    console.error('获取文件信息错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取文件信息失败',
    };
  }
}

/**
 * 复制文件
 */
export async function copyFile(
  bucket: R2Bucket,
  sourceKey: string,
  destinationKey: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    // 获取源文件
    const sourceFile = await bucket.get(sourceKey);

    if (!sourceFile) {
      return {
        success: false,
        error: '源文件不存在',
      };
    }

    // 复制到目标位置 — 保守断言 body 为可上传类型
    const body = sourceFile.body as Buffer | Blob | ReadableStream<Uint8Array>;
    await bucket.put(destinationKey, body, {
      httpMetadata: sourceFile.httpMetadata,
      customMetadata: sourceFile.customMetadata,
    });

    const url = generatePublicUrl(destinationKey);

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error('文件复制错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件复制失败',
    };
  }
}
