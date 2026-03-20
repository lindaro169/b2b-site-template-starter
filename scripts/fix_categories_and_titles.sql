-- ============================================
-- 模板分类修正脚本
-- 用于将导入的占位商品重新归类到演示分类
-- ============================================

-- 1. 模板手链类商品回归分类 1
UPDATE products SET category_id = 1 WHERE id IN (20, 21, 22, 23, 31, 32, 33);

-- 2. 其他占位手链样例回归分类 1
UPDATE products SET category_id = 1 WHERE id IN (50, 51, 53);

-- 3. 占位银饰样例归入分类 2
UPDATE products SET category_id = 2 WHERE id IN (24, 25, 26);

-- 4. 指定占位商品保留在分类 3
UPDATE products SET category_id = 3 WHERE id = 52;

-- ============================================
-- SEO 示例：为包含 Pendant 的标题补齐 Necklace
-- ============================================
UPDATE products
SET name = name || ' Necklace'
WHERE name LIKE '%Pendant%'
  AND name NOT LIKE '%Necklace%';
