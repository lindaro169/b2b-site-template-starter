import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site-config';

/**
 * GET /api/config
 * 返回客户端需要的公共配置
 *
 * 这个端点用于在 Cloudflare Workers 环境下传递 NEXT_PUBLIC_* 变量到客户端
 * 因为在 Workers 上直接访问 process.env.NEXT_PUBLIC_* 在客户端可能不可用
 */
export async function GET() {
  if (siteConfig.templateMode) {
    return NextResponse.json({
      googleClientId: siteConfig.googleClientId,
      website: siteConfig.websiteUrl,
      turnstileSiteKey: siteConfig.turnstileSiteKey,
      isPlaceholder: true,
    });
  }

  return NextResponse.json({
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    website: siteConfig.websiteUrl,
    turnstileSiteKey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '',
  });
}
