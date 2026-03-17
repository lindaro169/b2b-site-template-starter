# AI Developer Guide

本仓库是一个已经清洗过的模板工程。任何 AI 或开发者在继续修改前，都应假设以下内容全部属于占位层，而不是可直接发布的生产信息：

- 品牌名、域名、邮箱、管理员账号示例
- 产品标题、产品描述、FAQ、服务承诺、法务文案
- logo、favicon、产品图、场景图

## 推荐阅读顺序

1. [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md)
2. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. [docs/TECH_STACK.md](./docs/TECH_STACK.md)
4. [docs/DESIGN_LAYOUT.md](./docs/DESIGN_LAYOUT.md)
5. [docs/API_DESIGN.md](./docs/API_DESIGN.md)

## AI 修改规则

- 前台主要页面默认保持 `可发布前自行替换的模板文案`
- 除非用户明确要求，否则不要把占位信息改回看起来像真实公司的内容
- 任何新加的邮箱、域名、电话、社媒账号都使用 `.example.com` 或通用占位值
- 新增图片资源时，优先继续使用占位图或明确标记为 placeholder
- 修改部署文档时，不要写入真实仓库、真实域名或真实 Cloudflare 资源 ID

## 校验重点

- 搜索旧品牌、旧域名、旧邮箱是否仍有残留
- 确认 `public/logos/template-logo.svg` 与 `public/favicon.svg` 仍为占位资源
- 确认 `src/lib/site-config.ts` 中没有写入真实公司信息
