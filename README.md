# 模板网站说明

这是一个可直接拿来改造成新网站的模板仓库，适合做企业官网、目录站、品牌展示站或 B2B 询盘站。

仓库里现在看到的品牌名、域名、邮箱、产品图、logo、favicon、后台线索和大部分文案，都是 **mock data / placeholder**。它们的作用是让你先把网站跑起来、看版式、走流程，再逐步替换成自己的内容。

如果你是编程小白，先看：

- [新手起步指南](./docs/START_HERE.md)
- [AI 模板接手规则](./docs/AI_TEMPLATE_RULES.md)
- [AI 开工提示词模板](./docs/AI_PROMPT_TEMPLATES.md)

## 你可以先理解成这样

- 前台：给访客看的页面
- 后台：给你自己管理内容和线索的页面
- 模板模式：默认只使用 mock data，不会主动连真实业务数据
- 本地 D1：让后台设置和线索在你重启本地开发服务后还能保留

## 3 分钟跑起来

```bash
git clone https://github.com/your-org/template-catalog-starter.git
cd template-catalog-starter
pnpm install
pnpm db:local:setup
pnpm dev
```

本地地址：

```text
前台首页: http://localhost:3002
产品页:   http://localhost:3002/products
后台首页: http://localhost:3002/admin/dashboard
线索中心: http://localhost:3002/admin/contacts
```

说明：

- `pnpm db:local:setup` 会创建本地 D1，并写入纯 mock 的分类、产品、邮箱配置和线索样例
- 本地 D1 数据保存在 `.wrangler/`，会在同一工作目录内跨重启保留
- 如果你换机器、删了 `.wrangler/`，再执行一次 `pnpm db:local:setup` 即可

## 如果你想让 AI 帮你改这个网站

最稳的方式不是一句话让 AI “全改完”，而是按小步骤来。

推荐顺序：

1. 先让 AI 帮你跑起来并确认哪些内容是 mock
2. 再让 AI 先改品牌基础信息
3. 然后分页面改首页、产品页、关于页、服务页、联系页
4. 最后再接真实邮箱、真实登录、真实部署

可以直接这样对 AI 说：

```text
这是一个网站模板，请继续保持 mock data，不要放真实客户信息。
先把它改成一家做【行业/产品】的网站。
第一步只改首页和站点品牌基础信息，不要动后台逻辑。
改完后请告诉我本地该看哪些地址。
```

## 你最常会改的地方

- `src/lib/site-config.ts`
  站点名称、占位邮箱、默认联系方式、logo 路径、placeholder 说明
- `public/logos/template-logo.svg`
  站点 logo
- `public/favicon.svg`
  浏览器图标
- `src/app/`
  前台页面和后台页面
- `.env.local`、`.dev.vars`
  本地私有配置和第三方服务密钥

## 不要急着做的事

- 不要一开始就接真实 Google 登录
- 不要一开始就替换成真实客户数据
- 不要一开始就部署
- 不要把真实密钥直接写进仓库

## 文档导航

- [新手起步指南](./docs/START_HERE.md)
- [AI 模板接手规则](./docs/AI_TEMPLATE_RULES.md)
- [AI 开工提示词模板](./docs/AI_PROMPT_TEMPLATES.md)
- [架构说明](./docs/ARCHITECTURE.md)
- [技术栈与常用命令](./docs/TECH_STACK.md)
- [部署说明](./docs/DEPLOYMENT_GUIDE.md)
- [本地恢复说明](./docs/LOCAL_RESTORE_GUIDE.md)

## 发布前必须替换

- `src/lib/site-config.ts` 中所有占位值
- `.env.local` 与 `.dev.vars` 中的真实凭证
- `wrangler.jsonc` 中的域名、路由、Cloudflare 绑定
- 联系方式、邮箱、法务文案、服务承诺
- `public/logos/`、`public/favicon.svg`、`public/placeholders/` 中需要对外展示的资源

## 仓库边界

这个模板默认目标是：

- 本地可跑
- 前后台可演示
- 保持 mock data
- 便于 AI 在此基础上继续改站

它默认不是：

- 可直接拿去上线的真实品牌站
- 已接好所有第三方服务的生产系统
