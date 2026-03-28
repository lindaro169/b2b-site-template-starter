# 本地恢复说明

当你换电脑、换目录，或者不小心把本地缓存删掉时，用这份文档恢复。

## 哪些东西要保留

- `.env.local`
- `.dev.vars`

如果这两个文件里有你自己的真实密钥或真实邮箱配置，请自己妥善备份，但不要提交到仓库。

## 哪些东西不用备份

- `node_modules`
- `.next`
- `.open-next`
- 其他构建缓存

## 关于 `.wrangler`

`.wrangler/` 里保存的是本地 D1 数据。

这意味着：

- 如果你保留它，本地后台设置和 mock 线索也会一起保留
- 如果你删掉它，也没关系，只要重新执行一次初始化命令

## 恢复流程

```bash
git clone https://github.com/your-org/template-catalog-starter.git
cd template-catalog-starter
cp "/path/to/backup/.env.local" ".env.local"
cp "/path/to/backup/.dev.vars" ".dev.vars"
pnpm install
pnpm db:local:setup
pnpm dev
```

## 恢复后检查

- 首页可以打开
- `/products` 可以打开
- `/admin/dashboard` 可以打开
- `/admin/contacts` 可以打开
- 后台能看到 mock 线索和设置

## 如果恢复后还是不对

优先检查这几件事：

1. Node.js 版本是否太旧
2. `.env.local` 和 `.dev.vars` 是否丢了
3. 有没有重新执行 `pnpm db:local:setup`
4. 你是不是把真实配置和模板配置混在一起了
- 本地启动正常
- 没有把真实密钥写回仓库

## 关于 `.wrangler`

- `.wrangler/` 不需要备份，但它承载本地 D1 的实际数据文件
- 如果删除 `.wrangler/`，模板后台里的本地设置、线索和 D1 mock 数据也会一起消失
- 恢复或换机后，重新执行 `pnpm db:local:setup` 即可重建本地 D1
