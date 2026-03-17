# 本地恢复说明

## 适用场景

当你需要把仓库迁移到新的本地目录、外置硬盘或新机器时，按以下流程恢复。

## 需要保留的本地文件

- `.env.local`
- `.dev.vars`

## 不需要保留的内容

- `node_modules`
- `.next`
- `.wrangler`
- 其他缓存或构建产物

## 重新克隆示例

```bash
git clone https://github.com/your-org/template-catalog-starter.git
cd template-catalog-starter
```

## 恢复流程

```bash
cp "/path/to/backup/.env.local" ".env.local"
cp "/path/to/backup/.dev.vars" ".dev.vars"
pnpm install
pnpm dev
```

## 恢复后检查

- 环境变量已恢复
- 没有残留旧机器路径
- 本地启动正常
- 没有把真实密钥写回仓库
