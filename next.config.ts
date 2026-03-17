import type { NextConfig } from 'next'
// Only import and init OpenNextJS for local development
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev()
  })
}

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  typescript: {
    // 不再忽略类型错误，保证 CI/生产构建暴露类型问题以便修复
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
  },
  // 确保公共环境变量在客户端可用（Cloudflare Workers 兼容）
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_WEBSITE: process.env.NEXT_PUBLIC_WEBSITE,
    NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
  },
  // OpenNextJS 优化配置
  // 注意：这些选项优化应用以在 Workers 环境中运行
  compress: true, // 启用 gzip 压缩
  // 图片优化配置 - 使用 Cloudflare Image Resizing
  images: {
    // 在 Cloudflare Pages 上禁用 unoptimized，使用 Next.js 默认优化
    // 通过 Cloudflare Polish 进行额外优化
    unoptimized: false,
    // 定义允许的远程图片来源
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.template-catalog.example.com',
      },
      {
        protocol: 'https',
        hostname: 'media.template-catalog.example.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-template-catalog.r2.dev',
      },
    ],
    // 支持的图片格式（WebP 优化）
    formats: ['image/avif', 'image/webp'],
    // 根据视口大小生成的图片尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 缓存配置
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1年缓存
    // 优化配置
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }

    // Prevent jsdom from trying to load stylesheets during build
    if (!isServer) {
      config.module.rules.push({
        test: /node_modules\/jsdom/,
        use: 'null-loader',
      });
    }

    return config
  },
  // Force a unique build ID for every build to bust cache
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // 添加响应头用于缓存控制和安全
  // 在构建期间忽略 ESLint（临时，建议尽快修复 lint 报告）
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/contact',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://challenges.cloudflare.com;",
          },
        ],
      },
      {
        source: '/login',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/api/config',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon_io/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
