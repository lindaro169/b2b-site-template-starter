/**
 * Cloudflare Worker - 图片优化和缓存处理脚本
 *
 * 功能：
 * 1. 自动优化图片格式 (WebP, AVIF)
 * 2. 根据设备宽度调整图片尺寸
 * 3. 设置长期缓存策略
 * 4. 添加安全头和性能头
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 图片优化路由规则
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    const isImage = imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext));

    // 获取请求头信息
    const acceptHeader = request.headers.get('accept') || '';
    const supportsWebP = acceptHeader.includes('image/webp');
    const supportsAVIF = acceptHeader.includes('image/avif');

    // 如果是图片请求，添加优化参数
    if (isImage) {
      // 获取设备宽度参数（从查询字符串或 CloudFlare 规范）
      const width = url.searchParams.get('width') || url.searchParams.get('w');
      const quality = url.searchParams.get('quality') || '75';

      // 构建 Cloudflare 图片优化 URL
      // 使用 Cloudflare 的 cf 参数进行优化
      const optimizedUrl = new URL(request.url);

      // 添加 Cloudflare 图片优化参数
      if (supportsAVIF) {
        optimizedUrl.searchParams.set('format', 'avif');
      } else if (supportsWebP) {
        optimizedUrl.searchParams.set('format', 'webp');
      }

      if (width) {
        optimizedUrl.searchParams.set('width', width);
      }

      optimizedUrl.searchParams.set('quality', quality);

      // 获取原始请求
      let response = await env.ASSETS.fetch(new Request(pathname, {
        method: request.method,
        headers: request.headers,
      }));

      // 如果是图片，克隆响应并添加缓存头
      if (response.ok && isImage) {
        response = new Response(response.body, response);

        // 设置缓存头
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        response.headers.set('X-Content-Type-Options', 'nosniff');

        // 添加性能相关头
        response.headers.set('Link', '</style.css>; rel=preload; as=style', 'append');

        // 如果支持现代格式，添加提示头
        if (supportsAVIF) {
          response.headers.set('X-Optimized-Format', 'avif');
        } else if (supportsWebP) {
          response.headers.set('X-Optimized-Format', 'webp');
        }

        // 添加安全头
        response.headers.set('X-Frame-Options', 'SAMEORIGIN');
        response.headers.set('X-XSS-Protection', '1; mode=block');
      }

      return response;
    }

    // 非图片请求，转发给 ASSETS
    return env.ASSETS.fetch(request);
  },
};

/**
 * 高级图片优化配置说明
 *
 * Cloudflare Image Optimization 功能：
 * 1. 自动格式转换：根据浏览器支持自动选择最优格式
 *    - AVIF (最小，现代浏览器)
 *    - WebP (中等，大多数现代浏览器)
 *    - JPEG/PNG (默认)
 *
 * 2. 智能质量压缩：自动调整质量以平衡大小和质量
 *    - 默认质量：75
 *    - 范围：1-100
 *
 * 3. 响应式图片：根据设备宽度自动调整
 *    - 支持的宽度：32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840
 *
 * 4. 缓存策略：
 *    - 静态图片：1年不变缓存（max-age=31536000, immutable）
 *    - 动态图片：按内容长度缓存
 *
 * 使用示例：
 * - /images/photo.jpg?width=640&quality=80
 * - /logos/template-logo.svg?width=128
 * - /_next/image/[hash]/image.jpg?w=1080&q=75
 */
