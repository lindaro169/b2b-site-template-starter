/** biome-ignore-all lint/style/noNonNullAssertion: Ignore for this file */

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFiles = [".env.local", ".env", ".dev.vars"];

for (const envFile of envFiles) {
    config({ path: envFile, override: false });
}

function getRequiredEnv(name: string): string {
    const v = process.env[name];
    if (!v) {
        throw new Error(
            `Required environment variable ${name} is not set. Configure it in .env.local or your shell before running drizzle commands.`
        );
    }
    return v;
}

export default defineConfig({
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    driver: "d1-http",
    dbCredentials: {
        accountId: getRequiredEnv('CLOUDFLARE_ACCOUNT_ID'),
        databaseId: getRequiredEnv('CLOUDFLARE_D1_DATABASE_ID'),
        token: getRequiredEnv('CLOUDFLARE_D1_TOKEN'),
    },
});
