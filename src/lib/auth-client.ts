import { createAuthClient } from "better-auth/react";
import { siteConfig } from '@/lib/site-config';

export const authClient = createAuthClient({
    baseURL: siteConfig.templateMode
        ? siteConfig.websiteUrl
        : process.env.NEXT_PUBLIC_WEBSITE || "http://localhost:3002",
});
