-- Migration: Remove slug unique constraint from categories table
-- This allows multiple subcategories to use the same slug under different parent categories
-- For hierarchical URL structure: /products/{parent-slug}/{child-slug}

DROP INDEX IF EXISTS categories_slug_unique;
