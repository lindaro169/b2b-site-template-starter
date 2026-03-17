import * as fs from 'fs';
import { SAMPLE_PRODUCTS } from '../src/lib/sample-data';

const ACCOUNT_ID = '4513a648eef0a2ee0852c883c7c29d12';
const BUCKET = 'template-catalog-assets';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!TOKEN) {
    console.error("需要 CLOUDFLARE_API_TOKEN 环境变量");
    process.exit(1);
}

const R2_API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`;

async function cleanupR2() {
    console.log("🔍 分析清理 R2 垃圾图片...");

    // 1. 抓取本地合法的 61 个商品唯一图片 Key 白名单
    const safeImageKeys = new Set(
        SAMPLE_PRODUCTS.map(p => {
            // 提取像 "/products/S-529/image.jpg" 这种路径
            let url = p.imageUrl || '';
            return url.startsWith('/') ? url.substring(1) : url;
        }).filter(p => !!p)
    );
    console.log(`✅ 白名单中允许保留的有效图片总计: ${safeImageKeys.size} 张`);

    // 2. 通过 API 罗列 R2 服务器该 Bucket 下所有文件
    try {
        const listResponse = await fetch(R2_API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!listResponse.ok) {
            throw new Error(`无法获取 R2 列表: ${listResponse.status} ${listResponse.statusText}`);
        }

        const listData = await listResponse.json();
        const allR2Objects = listData.result || [];
        console.log(`☁️ R2 存储桶中当前发现对象总计: ${allR2Objects.length} 张图片`);

        const deletionsNeeded = [];
        allR2Objects.forEach(obj => {
            // 这里 obj.key 例如 "products/S-065/image.jpg"
            if (!safeImageKeys.has(obj.key)) {
                deletionsNeeded.push(obj.key);
            }
        });

        if (deletionsNeeded.length === 0) {
            console.log('🎉 恭喜！R2 云端图库非常纯净，没有多余垃圾图片需要清理。');
            return;
        }

        console.log(`🗑️ 扫描到 ${deletionsNeeded.length} 张未被使用的孤儿图片，准备彻底销毁...`);

        // 3. 遍历删除无用对象
        let deletedCount = 0;
        for (const trashKey of deletionsNeeded) {
            const deleteUrl = `${R2_API_URL}/${encodeURIComponent(trashKey)}`;
            const deleteRes = await fetch(deleteUrl, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${TOKEN}` }
            });

            if (deleteRes.ok) {
                console.log(`❌ 已删除: ${trashKey}`);
                deletedCount++;
            } else {
                console.error(`⚠️ 删除失败 ${trashKey}: ${deleteRes.status}`);
            }
        }

        console.log(`\n✅ 究极净化完毕！成功清除 ${deletedCount} 张云端废弃图片，R2 空间已释放！`);

    } catch (error) {
        console.error("❌ 清理过程中发生错误:", error);
    }
}

cleanupR2();
