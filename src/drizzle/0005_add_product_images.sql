-- 产品表扩展：补齐多图字段
-- Migration: Add product images JSON column

ALTER TABLE products ADD COLUMN images TEXT;
