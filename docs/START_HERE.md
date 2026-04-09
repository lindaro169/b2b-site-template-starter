# 新手起步指南

这份文档是写给 **编程小白** 的。

目标不是让你学会所有技术，而是让你能把这个模板网站跑起来，并且知道怎么让 AI 一步一步帮你改成自己的新网站。

先记住这条硬规则：

- 默认用 `pnpm dev`
- 除非你明确要跑 `wrangler dev`，否则不要创建 `.dev.vars`
- 如果你当前只是看模板和 mock data，通常不需要 `.env.local`

## 你会得到什么

这个模板默认已经带好这些能力：

- 前台页面
- 后台管理页面
- 产品列表和产品详情
- 联系表单和询盘表单
- 线索中心
- 博客骨架
- Cloudflare 部署骨架

但里面的内容默认还是模板占位内容，也就是 mock data。

## 第一步：先把网站跑起来

先准备：

- Node.js 20 或更高
- `pnpm`
- 一个终端

然后执行：

```bash
git clone https://github.com/your-org/template-catalog-starter.git
cd template-catalog-starter
pnpm install
pnpm db:local:setup
pnpm dev
```

这里的 `pnpm dev` 就是默认推荐路径，也就是 `next dev`。

为什么默认用它：

- 启动更直接
- 改页面反馈更快
- 对模板使用者最不容易搞混
- 不要求你先理解 Cloudflare Worker 运行时

只有你后面要做 Cloudflare 运行时一致性检查、Worker 绑定联调、部署前验证时，再考虑 `wrangler dev`。

打开下面这些地址：

```text
http://localhost:3002
http://localhost:3002/products
http://localhost:3002/admin/dashboard
http://localhost:3002/admin/contacts
```

如果这些地址能打开，说明模板已经在你本地跑起来了。

如果你当前只是看模板、改 mock data、改页面结构，通常不需要创建 `.env.local`，也不需要 `.dev.vars`。

## 第二步：先知道哪些东西是假的

当前这些内容都默认是模板占位信息：

- 公司名
- 域名
- 邮箱
- 联系电话
- logo
- favicon
- 产品标题和产品图
- 后台线索
- 大部分介绍文案

所以你现在看到的内容，不是“错”，而是“留给你之后替换”的。

## 第三步：让 AI 帮你改，但一次只改一小块

不要一上来就说：

```text
把整个网站全部改完并上线
```

这样很容易把事情做乱。

推荐你这样一步步说：

### 先改品牌方向

```text
这是一个网站模板，请继续保持 mock data，不要写真实客户数据。
先把它改成一家做【你的行业】的网站。
第一步只改品牌名称、首页标题、首页副标题和 logo 文案。
不要动后台逻辑。
```

### 再改前台页面

```text
继续保持 mock data。
现在只改首页、关于页、服务页、联系页的文案结构。
先不要改产品数据和后台。
```

### 再改产品区

```text
把 /products 改成适合【你的行业】的分类和产品展示结构。
先继续使用 mock data，不要接真实数据库。
```

### 最后再接真实内容和部署

```text
现在开始把模板里的 mock data 替换成我的真实品牌信息。
请先列出需要我提供的资料，再分步骤修改。
```

## 第四步：你最常会改的文件

### `src/lib/site-config.ts`

这里是站点基础信息入口，通常要改：

- 品牌名
- 联系方式
- logo 路径
- 默认邮箱
- 模板说明文案

### `public/logos/template-logo.svg`

这里是当前的 mock logo。

### `public/favicon.svg`

这里是当前的 mock favicon。

### `src/app/`

这里是页面本体：

- 首页
- 产品页
- 关于页
- 服务页
- 联系页
- 后台页面

## 第五步：每改完一次怎么检查

每次改完，你只做这几件事：

1. 刷新本地页面
2. 看前台和后台有没有报错
3. 让 AI 再跑一次 `pnpm type-check`
4. 如果改了样式，就重点打开 `/`、`/products`、`/admin/dashboard`、`/admin/contacts`

## 第六步：什么时候再接真实服务

这些事情建议放到后面：

- Google 登录
- 真实邮件发送
- 真实 Cloudflare 绑定
- 真实域名
- 真实产品数据

原因很简单：

- 你先把“网站长什么样”确定下来
- 再把“数据和服务怎么接”接上去

这样不容易乱。

## 你最容易踩的坑

- 一开始就放真实客户数据
- 一开始就接真实第三方服务
- 让 AI 一次改太多东西
- 改完不验证页面
- 不知道哪些文件才是关键入口

## 推荐阅读顺序

1. 先看本文
2. 再看 [README](../README.md)
3. 如果你要让 AI 继续接手，先看 [AI_TEMPLATE_RULES.md](./AI_TEMPLATE_RULES.md)
4. 如果你想直接复制提示词给 AI，用 [AI_PROMPT_TEMPLATES.md](./AI_PROMPT_TEMPLATES.md)
5. 需要理解结构时看 [ARCHITECTURE.md](./ARCHITECTURE.md)
6. 需要知道命令时看 [TECH_STACK.md](./TECH_STACK.md)
7. 准备上线时再看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 如果你只记住一句话

先跑起来，先保持 mock data，先一小步一小步让 AI 改，再考虑真实登录、真实邮件和真实部署。
