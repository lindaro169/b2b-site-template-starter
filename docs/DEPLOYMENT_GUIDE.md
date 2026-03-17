# 部署说明

## 目标

将当前模板站点部署到你自己的 Cloudflare 账号与域名，不复用仓库中的占位品牌信息。

## 部署前准备

1. 创建 D1 数据库
2. 创建 R2 存储桶
3. 创建 KV 命名空间
4. 准备认证、邮件与人机验证所需真实凭证
5. 替换模板域名、邮箱与公开资源地址

## 必须修改的文件

- `wrangler.jsonc`
- `.env.local`
- `.dev.vars`
- `src/lib/site-config.ts`
- `public/favicon_io/site.webmanifest`

## 最小部署流程

```bash
pnpm install
pnpm build
pnpm wrangler deploy
```

## 发布前核对

- 域名、回调地址、公开路由已替换
- 邮箱、管理员白名单与邮件发送地址已替换
- 站点标识图、浏览器图标、产品图已替换
- 法务页面与服务承诺已替换
- 没有把 `.example.com` 域名或模板示例值带到生产环境
