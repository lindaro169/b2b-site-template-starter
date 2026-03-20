# 模板目录站说明

这是一个已经完成基础清洗的模板站点，适合继续改造成企业目录站、品牌展示站或 B2B 询盘站。仓库中的品牌名、域名、邮箱、产品图、站点标识图、浏览器图标、服务文案、法务文案与联系信息均为占位内容，发布前必须替换。

## 当前状态

- 前台主要页面已统一为“可发布前自行替换的模板文案”
- 默认站点标识图使用 `public/logos/template-logo.svg`
- 默认浏览器图标使用 `public/favicon.svg`
- 默认产品图与场景图使用 `public/placeholders/` 下的占位资源
- `docs/` 与本文档已切换为中文模板说明

## 适用场景

- 需要保留后台、博客、询盘、部署骨架的项目启动
- 需要先用占位内容验收版式，再替换正式内容
- 需要部署到 Cloudflare Workers、D1、R2 的目录型站点

## 快速开始

```bash
git clone https://github.com/your-org/template-catalog-starter.git
cd template-catalog-starter
pnpm install
pnpm dev
```

本地默认访问地址：

```text
http://localhost:3002
```

## 本地私有配置

不要把真实凭证提交进仓库。请在以下文件中填写你的真实配置：

- `.env.local`
- `.dev.vars`

模板示例：

```bash
NEXT_PUBLIC_WEBSITE=http://localhost:3002
BETTER_AUTH_SECRET=mock-better-auth-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=mock-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=mock-google-client-secret
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=mock-turnstile-site-key
CLOUDFLARE_TURNSTILE_SECRET_KEY=mock-turnstile-secret-key
RESEND_API_KEY=re_mock_template_key
RESEND_FROM_EMAIL=contact@template-site-placeholder.example
SALES_NOTIFICATION_EMAIL=admin@template-site-placeholder.example
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEMPLATE0000
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-TEMPLATE0000
NEXT_PUBLIC_GOOGLE_ADS_INQUIRY_LABEL=template_inquiry_label
GOOGLE_ADS_FEED_USERNAME=template-feed-user
GOOGLE_ADS_FEED_PASSWORD=template-feed-password
```

## 目录结构

```text
src/
  app/                 页面与接口
  components/          前台与后台组件
  lib/                 配置、认证、邮件、数据库逻辑
  drizzle/             数据表定义与迁移
public/
  logos/               占位站点标识图
  placeholders/        占位产品图与场景图
docs/                  中文模板文档
```

## 发布前必须替换

- `src/lib/site-config.ts` 中的所有占位值
- `.env.local` 与 `.dev.vars` 中的真实凭证
- `wrangler.jsonc` 中的域名、路由、绑定与公开地址
- 联系方式、管理员邮箱白名单、法务文案与服务承诺
- 占位产品图、站点标识图、浏览器图标与产品说明

## 相关文档

- [项目背景](./docs/PROJECT_CONTEXT.md)
- [架构说明](./docs/ARCHITECTURE.md)
- [技术栈说明](./docs/TECH_STACK.md)
- [部署说明](./docs/DEPLOYMENT_GUIDE.md)
- [版式说明](./docs/DESIGN_LAYOUT.md)
- [设计基线](./docs/DESIGN_REFERENCE.md)
- [接口说明](./docs/API_DESIGN.md)
- [组件清单](./docs/COMPONENT_INVENTORY.md)
- [本地恢复说明](./docs/LOCAL_RESTORE_GUIDE.md)

## 清洗范围

本轮清洗已覆盖：

- 真实品牌与旧域名替换
- 对用户可见的主要页面文案替换
- `README.md` 与 `docs/` 中文化
- 占位站点标识图与浏览器图标切换
- 默认产品图片替换为占位图
