# 技术栈说明

## 核心技术

| 类别 | 方案 |
|---|---|
| 框架 | Next.js 15 |
| 界面 | React 19 |
| 语言 | TypeScript |
| 数据库 | Cloudflare D1 与 Drizzle ORM |
| 文件存储 | Cloudflare R2 |
| 部署 | Cloudflare Workers 与 OpenNext |
| 认证 | BetterAuth |
| 邮件 | Resend |
| 验证 | Cloudflare Turnstile |

## 常用命令

```bash
pnpm install
pnpm dev
pnpm lint
pnpm type-check
```

## 模板环境变量

```bash
NEXT_PUBLIC_WEBSITE=http://localhost:3002
BETTER_AUTH_SECRET=replace-with-a-real-secret
GOOGLE_CLIENT_ID=replace-with-your-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-your-google-client-secret
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=replace-with-your-turnstile-site-key
CLOUDFLARE_TURNSTILE_SECRET_KEY=replace-with-your-turnstile-secret-key
RESEND_API_KEY=replace-with-your-resend-api-key
RESEND_FROM_EMAIL=hello@template-catalog.example.com
SALES_NOTIFICATION_EMAIL=hello@template-catalog.example.com
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_INQUIRY_LABEL=replace-with-your-google-ads-label
GOOGLE_ADS_FEED_USERNAME=replace-with-your-feed-username
GOOGLE_ADS_FEED_PASSWORD=replace-with-your-feed-password
```

## 注意事项

- 文档中的域名、邮箱与绑定名全部是模板示例
- 真实密钥只放在 `.env.local` 或 `.dev.vars`
- 发布前同步更新 `next.config.ts`、`wrangler.jsonc` 和 `src/lib/site-config.ts`
