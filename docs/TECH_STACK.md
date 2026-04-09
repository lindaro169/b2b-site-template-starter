# 技术栈与常用命令

如果你是编程小白，这份文档只需要记住两件事：

- 平时最常用的是 `pnpm dev`
- 本地想保留后台设置和线索，要先跑 `pnpm db:local:setup`

## 核心技术

| 类别 | 当前方案 | 你可以怎么理解 |
|---|---|---|
| 前端框架 | Next.js 15 | 页面和接口都在一个项目里 |
| 界面 | React 19 | 页面组件化开发 |
| 语言 | TypeScript + JavaScript | 一部分文件强类型，一部分文件是普通 JS |
| 数据库 | Cloudflare D1 + Drizzle ORM | 本地和线上都可用的 SQLite 风格数据库 |
| 部署 | OpenNext + Cloudflare Workers | 将 Next.js 部署到 Cloudflare |
| 认证 | Better Auth | 后台登录 |
| 邮件 | Resend | 联系和询盘邮件 |
| 验证 | Cloudflare Turnstile | 表单人机验证 |
| 归因跟踪 | 服务端 attribution session | 表单不提交 tracking JSON，后端按 session 拼 tracking 快照 |

## 最常用命令

```bash
pnpm install
pnpm db:local:setup
pnpm dev
pnpm check:repo-safety
pnpm type-check
pnpm lint
```

默认推荐：

- `pnpm dev`
  日常本地开发主路径，底层是 `next dev`

按需使用：

- `wrangler dev`
  只在你需要检查 Cloudflare Worker 运行时差异、绑定注入或部署前一致性时使用

## 每个命令是干什么的

- `pnpm install`
  安装依赖
- `pnpm db:local:setup`
  初始化本地 D1，并写入 mock 数据
- `pnpm dev`
  启动本地开发服务
- `pnpm check:repo-safety`
  检查是否误提交本地私有环境文件或疑似真实 secret
- `pnpm type-check`
  检查 TypeScript 类型
- `pnpm lint`
  检查代码规范问题

## 本地开发时你通常会用到的地址

```text
http://localhost:3002
http://localhost:3002/products
http://localhost:3002/admin/dashboard
http://localhost:3002/admin/contacts
```

## 本地环境变量

不要把真实密钥提交进仓库。

默认本地文件：

- `.env.local`

模板值应该保持占位语义，例如：

```bash
NEXT_PUBLIC_WEBSITE=http://localhost:3002
BETTER_AUTH_SECRET=mock-better-auth-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=mock-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=mock-google-client-secret
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=mock-turnstile-site-key
CLOUDFLARE_TURNSTILE_SECRET_KEY=mock-turnstile-secret-key
RESEND_API_KEY=re_mock_template_key
RESEND_FROM_EMAIL=contact@template-site-placeholder.example
ADMIN_EMAIL=admin@template-site-placeholder.example
NEXT_PUBLIC_PREVIEW_ADMIN_EMAIL=admin@template-site-placeholder.example
SALES_NOTIFICATION_EMAIL=admin@template-site-placeholder.example
GOOGLE_ADS_FEED_USERNAME=template-feed-user
GOOGLE_ADS_FEED_PASSWORD=template-feed-password
```

如果你只看前台页面，`ADMIN_EMAIL` 可以稍后再配；只要你要看 `/admin` 或调用后台接口，就必须先配它。

本地模板预览模式下，后台不会走真实 Google 登录或 Turnstile。要看本地后台界面，请直接访问 `/admin/dashboard`。

变量职责要分开理解：

- `ADMIN_EMAIL`：服务端使用的后台管理员邮箱白名单；本地预览模式下，服务端 mock session 也使用它
- `NEXT_PUBLIC_PREVIEW_ADMIN_EMAIL`：客户端本地预览模式下展示用的管理员邮箱；只影响前端显示，不参与真实认证

真实 Google 登录、Turnstile、人机验证和回调域名联调，应放在预发布或正式环境测试，不要等正式上线后才第一次验证。

`.dev.vars` 不是模板默认必需文件。只有你明确要跑 Wrangler 专用的本地调试链路，或者要兼容个别只认 `.dev.vars` 的工具时，才额外创建它。需要时，复制 [`.dev.vars.example`](/Users/linda/Documents/coding-projects/b2b%20site%20template%20starter/.dev.vars.example) 为你自己的 `.dev.vars`。

推荐分层：

- `.env.local`
  Next.js 本地开发唯一默认私有入口
- `.dev.vars`
  Wrangler / Worker runtime 本地调试专用入口，不是默认必需
- GitHub / Cloudflare Secrets
  preview / production 的真实 secret
- `.env.example`
  只保留 mock 值、占位值和公开示例

## 什么时候再去研究更深的技术细节

只有当你遇到下面这些问题时，再去深挖：

- 为什么后台数据没有保留
- 为什么 Google 登录失败
- 为什么部署到 Cloudflare 后打不开
- 为什么邮件没有发出去

否则你只要先把网站跑起来，再让 AI 分步骤改页面就够了。

## 注意事项

- 文档中的域名、邮箱与绑定名全部是模板示例
- 真实密钥不要进仓库；本地放 `.env.local`，线上放部署平台 secrets
- 发布前同步更新 `next.config.ts`、`wrangler.jsonc` 和 `src/lib/site-config.ts`
