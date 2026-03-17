-- 产品表扩展：新增 B2B 详情字段
-- Migration: Add B2B product detail fields

ALTER TABLE products ADD COLUMN material TEXT;
ALTER TABLE products ADD COLUMN moq TEXT;
ALTER TABLE products ADD COLUMN lead_time TEXT;
ALTER TABLE products ADD COLUMN attributes TEXT;
ALTER TABLE products ADD COLUMN sku_variants TEXT;

-- 为现有产品设置默认 MOQ 和 交期
UPDATE products SET
  moq = 'Ready Stock: 5 pcs/style | Custom: MOQ 50 pcs',
  lead_time = 'Ready Stock: 3-5 days | Custom: 15-20 days'
WHERE moq IS NULL;
