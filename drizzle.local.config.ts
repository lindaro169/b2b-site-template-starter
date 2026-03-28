import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function resolveLocalD1Path() {
    const explicitPath = process.env.LOCAL_D1_SQLITE_PATH;
    if (explicitPath) {
        return explicitPath.startsWith("file:") ? explicitPath : `file:${explicitPath}`;
    }

    const d1StateDir = path.resolve(
        process.cwd(),
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject"
    );

    if (!fs.existsSync(d1StateDir)) {
        throw new Error(
            "未找到本地 D1 SQLite 文件。请先运行 `pnpm db:local:setup` 或设置 LOCAL_D1_SQLITE_PATH。"
        );
    }

    const candidates = fs
        .readdirSync(d1StateDir)
        .filter((entry) => entry.endsWith(".sqlite"))
        .map((entry) => path.join(d1StateDir, entry))
        .sort((left, right) => {
            const leftTime = fs.statSync(left).mtimeMs;
            const rightTime = fs.statSync(right).mtimeMs;
            return rightTime - leftTime;
        });

    if (candidates.length === 0) {
        throw new Error(
            "本地 D1 目录存在，但没有 SQLite 文件。请先运行 `pnpm db:local:setup`。"
        );
    }

    return `file:${candidates[0]}`;
}

export default defineConfig({
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: resolveLocalD1Path(),
    },
});
