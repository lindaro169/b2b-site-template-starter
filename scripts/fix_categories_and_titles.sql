-- ============================================
-- 修复 fix_categories.sql 造成的分类破坏
-- 恢复产品到正确的分类
-- ============================================

-- 1. Healing Crystal Jewelry (category 1) 系列的手链
-- 这些是无银、天然水晶的手链，应归回 category 1
UPDATE products SET category_id = 1 WHERE id IN (20, 21, 22, 23, 31, 32, 33);

-- 2. Healing Crystal Jewelry (category 1) 系列的手链 (大号 SKU)
-- 50: Super Seven Amethyst Bracelet, 51: Amethyst Beaded Bracelet, 53: Amethyst Unique Bracelet
UPDATE products SET category_id = 1 WHERE id IN (50, 51, 53);

-- 3. 925 Silver & Crystal Jewelry (category 2) 系列的手链 (银质)
-- 24, 25, 26 是 925 银+水晶的时尚手链
UPDATE products SET category_id = 2 WHERE id IN (24, 25, 26);

-- 4. Chakra & Yoga Jewelry (category 3)
-- 52: Natural Silver 925 Clear Quartz Lapis Lazuli 这款含 Lapis Lazuli（查克拉石），保留在 3
UPDATE products SET category_id = 3 WHERE id = 52;

-- ============================================
-- SEO 优化：给所有 Pendant 产品标题追加 " Necklace"
-- ============================================
UPDATE products
SET name = name || ' Necklace'
WHERE name LIKE '%Pendant%'
  AND name NOT LIKE '%Necklace%';
