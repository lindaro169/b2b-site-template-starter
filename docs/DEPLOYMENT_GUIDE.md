# 部署说明

这份文档只在你准备把网站正式上线时再看。

如果你现在还在本地改页面、调版式、换 mock data，可以先不用看这份文档。

## 上线前必须先完成的事

1. 把模板里的 mock 品牌信息替换掉
2. 把 logo、favicon、产品图替换掉
3. 准备你自己的 Cloudflare 资源
4. 准备真实环境变量和真实邮箱配置
5. 确认没有把 `.example.com`、placeholder 邮箱或 mock 文案带进生产

## 你需要准备的 Cloudflare 资源

- D1 数据库
- R2 存储桶
- KV 命名空间
- Cloudflare Workers 部署权限

## 你通常要改的文件

- `wrangler.jsonc`
- `.env.local`
- `src/lib/site-config.ts`
- `public/favicon_io/site.webmanifest`

说明：

- `.env.local` 只用于本地私有配置，不上传仓库
- 生产 / preview 的真实 secret 不写进仓库，也不依赖 `.env.local`
- 生产 / preview 的真实 secret 应配置在 GitHub Actions secrets、Cloudflare Workers secrets 或对应平台的环境变量管理中

## 最小部署流程

```bash
pnpm install
pnpm build
pnpm deploy
```

## 上线前检查清单

- 真实域名已填好
- 真实邮箱已配置
- Google 登录回调地址已改成你的正式域名
- Turnstile 已切换成真实 key
- 后台不再依赖模板 mock 语义
- 前台页面没有明显 placeholder 文案
- logo 和 favicon 已替换

## 最容易漏掉的地方

- `src/lib/site-config.ts` 里的占位邮箱和品牌名
- `wrangler.jsonc` 里的域名、路由、绑定 ID
- `public/favicon.svg` 和 `public/logos/template-logo.svg`
- 邮件接收邮箱与 `ADMIN_EMAIL` 管理员登录邮箱
- `NEXT_PUBLIC_PREVIEW_ADMIN_EMAIL` 仅用于本地预览显示，不是正式环境认证必需项
