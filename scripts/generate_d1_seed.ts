import * as fs from 'fs';
import { SAMPLE_PRODUCTS } from '../src/lib/sample-data';

function generateSQL() {
  const values = SAMPLE_PRODUCTS.map((p: any, index: number) => {
    const id = p.id || (index + 1);
    const name = p.name.replace(/'/g, "''");
    const slug = p.slug;
    const desc = p.description.replace(/'/g, "''");
    const price = p.price;
    const categoryId = p.categoryId || 1;
    const imageUrl = p.imageUrl ? `'${p.imageUrl}'` : 'NULL';
    const material = p.material ? `'${p.material.replace(/'/g, "''")}'` : 'NULL';
    const moq = p.moq ? `'${p.moq.replace(/'/g, "''")}'` : 'NULL';
    const leadTime = p.leadTime ? `'${p.leadTime.replace(/'/g, "''")}'` : 'NULL';

    const attrsObj = {
      certifications: p.certifications || [],
      customizationOptions: p.customizationOptions || [],
      tags: p.tags || []
    };
    const attributes = `'${JSON.stringify(attrsObj).replace(/'/g, "''")}'`;

    const skuVariants = 'NULL';
    const images = p.gallery && p.gallery.length > 0 ? `'${JSON.stringify(p.gallery).replace(/'/g, "''")}'` : 'NULL';
    const isActive = 1;

    return `(${id}, '${name}', '${slug}', '${desc}', ${price}, ${categoryId}, ${imageUrl}, ${material}, ${moq}, ${leadTime}, ${attributes}, ${skuVariants}, ${images}, ${isActive}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
  }).join(',\n  ');

  const sql = `
-- 纯净版 D1 数据库 61 款商品补录脚本，字段对齐正确版 src/drizzle/schema.ts
DROP TABLE IF EXISTS \`products\`;

CREATE TABLE \`products\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`name\` text NOT NULL,
  \`slug\` text NOT NULL,
  \`description\` text,
  \`price\` real,
  \`category_id\` integer,
  \`image_url\` text,
  \`material\` text,
  \`moq\` text,
  \`lead_time\` text,
  \`attributes\` text,
  \`sku_variants\` text,
  \`images\` text,
  \`is_active\` integer DEFAULT 1,
  \`created_at\` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  \`updated_at\` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null
);

CREATE UNIQUE INDEX IF NOT EXISTS \`products_slug_unique\` ON \`products\` (\`slug\`);

INSERT INTO \`products\` (
  \`id\`, \`name\`, \`slug\`, \`description\`, \`price\`, \`category_id\`, \`image_url\`,
  \`material\`, \`moq\`, \`lead_time\`, \`attributes\`, \`sku_variants\`, \`images\`, \`is_active\`,
  \`created_at\`, \`updated_at\`
) VALUES 
  ${values};
  `;

  fs.writeFileSync('scripts/d1_seed_online.sql', sql);
  console.log('✅ 生成 61 条纯正格式产品的 SQL 成功！ => scripts/d1_seed_online.sql');
}

generateSQL();
