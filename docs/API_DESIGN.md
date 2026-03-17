# 接口说明

## 公开接口

| 方法 | 路径 | 作用 |
|---|---|---|
| `GET` | `/api/products` | 获取产品列表 |
| `GET` | `/api/products/[id]` | 获取单个产品 |
| `GET` | `/api/products/slug/[slug]` | 按 `slug` 获取产品 |
| `GET` | `/api/categories` | 获取分类列表 |
| `GET` | `/api/posts` | 获取文章列表 |
| `POST` | `/api/contact` | 提交联系表单 |
| `POST` | `/api/inquiries` | 提交产品询盘 |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/config` | 获取公开模板配置 |

## 返回格式

成功：

```json
{
  "success": true,
  "data": {}
}
```

失败：

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误说明"
}
```

## 模板约束

- 文档中的示例域名、邮箱与图片地址均为占位值
- 联系方式、品牌字段、产品描述字段都不是生产信息
- 发布前应同时检查接口返回内容与前台展示文案是否已替换

## 后台接口

后台沿用现有产品、分类、文章、作者、上传与线索管理接口。上线前至少完成以下事项：

- 配置认证
- 配置管理员邮箱白名单
- 校验上传与邮件通知逻辑
- 替换所有公开占位字段
