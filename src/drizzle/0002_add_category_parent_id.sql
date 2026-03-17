-- Migration: Add parent_id column to categories table
-- This enables hierarchical category structure (parent/child relationships)

ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
