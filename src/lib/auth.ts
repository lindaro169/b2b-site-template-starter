import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@/lib/d1-db';
import { getAdminEmail } from '@/lib/global-config';
import { siteConfig } from '@/lib/site-config';
import { createTemplateAdminSession } from '@/lib/template-admin';
import * as schema from '../drizzle/schema';

type AuthInstance = ReturnType<typeof createAuthInstance>;
type AuthEnv = {
    DB?: D1Database;
    NEXT_PUBLIC_WEBSITE?: string;
    BETTER_AUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
};

let authInstance: AuthInstance | null = null;

function shouldUseSecureCookies(url?: string): boolean {
    if (!url) {
        return false;
    }

    try {
        const parsed = new URL(url);
        return (
            parsed.protocol === 'https:' &&
            parsed.hostname !== 'localhost' &&
            parsed.hostname !== '127.0.0.1'
        );
    } catch {
        return false;
    }
}

export async function initAuth() {
    if (authInstance) return authInstance;

    const processEnv = process.env as NodeJS.ProcessEnv & { DB?: D1Database };
    let dbBinding = processEnv.DB;
    let websiteUrl = siteConfig.localPreviewMode ? siteConfig.websiteUrl : process.env.NEXT_PUBLIC_WEBSITE;
    let betterAuthSecret = siteConfig.localPreviewMode ? siteConfig.betterAuthSecret : process.env.BETTER_AUTH_SECRET;
    let googleClientId = siteConfig.localPreviewMode ? siteConfig.googleClientId : process.env.GOOGLE_CLIENT_ID;
    let googleClientSecret = siteConfig.localPreviewMode ? siteConfig.googleClientSecret : process.env.GOOGLE_CLIENT_SECRET;

    if (!siteConfig.localPreviewMode && (!dbBinding || !websiteUrl || !betterAuthSecret)) {
        try {
            const ctx = await getCloudflareContext();
            if (ctx && ctx.env) {
                const env = ctx.env as AuthEnv;
                dbBinding = dbBinding || env.DB;
                websiteUrl = websiteUrl || env.NEXT_PUBLIC_WEBSITE;
                betterAuthSecret = betterAuthSecret || env.BETTER_AUTH_SECRET;
                googleClientId = googleClientId || env.GOOGLE_CLIENT_ID || env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                googleClientSecret = googleClientSecret || env.GOOGLE_CLIENT_SECRET;
            }
        } catch (e) {
            console.error('Failed to get Cloudflare context', e);
        }
    }

    if (!dbBinding) console.warn('DB binding not found');
    if (!websiteUrl) console.warn('NEXT_PUBLIC_WEBSITE not found');
    if (!betterAuthSecret) console.warn('BETTER_AUTH_SECRET not found');

    if (!dbBinding) {
        throw new Error('DB binding not found');
    }

    if (!websiteUrl || !betterAuthSecret) {
        throw new Error('Better Auth configuration is incomplete');
    }

    const adminEmail = getAdminEmail().toLowerCase();

    authInstance = createAuthInstance({
        dbBinding,
        betterAuthSecret,
        googleClientId,
        googleClientSecret,
        websiteUrl,
        adminEmail,
    });


    return authInstance;
}

type CreateAuthInstanceInput = {
    dbBinding: D1Database;
    betterAuthSecret: string;
    googleClientId?: string;
    googleClientSecret?: string;
    websiteUrl: string;
    adminEmail: string;
};

function createAuthInstance({
    dbBinding,
    betterAuthSecret,
    googleClientId,
    googleClientSecret,
    websiteUrl,
    adminEmail,
}: CreateAuthInstanceInput) {
    return betterAuth({
        database: drizzleAdapter(drizzle(dbBinding), {
            provider: 'sqlite',
            schema: {
                ...schema,
                user: schema.user,
                session: schema.session,
                account: schema.account,
                verification: schema.verification,
            },
        }),
        secret: betterAuthSecret,
        emailAndPassword: {
            enabled: false, // Disable email/password login
        },
        socialProviders: {
            google: {
                clientId: googleClientId as string,
                clientSecret: googleClientSecret as string,
            },
        },
        baseURL: websiteUrl,
        trustedOrigins: [
            websiteUrl || siteConfig.websiteUrl,
        ],
        advanced: {
            useSecureCookies: shouldUseSecureCookies(websiteUrl),
            cookiePrefix: 'better-auth',
        },
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // 1 day
            cookieCache: {
                enabled: false,
                maxAge: 5 * 60,
            },
        },
        // Validate email whitelist after successful OAuth
        onSuccess: async (ctx) => {
            const email = ctx.user?.email?.toLowerCase();
            const allowedEmails = [adminEmail];

            if (!email || !allowedEmails.includes(email)) {
                console.warn(`Unauthorized login attempt: ${email}`);
                // Delete the session and user if not in whitelist
                throw new Error('你不是后台管理员');
            }

            console.log(`Authorized login: ${email}`);
        },
    });
}

export const auth = new Proxy({} as AuthInstance, {
    get(_target, prop, receiver) {
        if (authInstance) {
            return Reflect.get(authInstance, prop, receiver);
        }
        // If accessed before init, we can't do much if it's sync access.
        // But better-auth usage in routes is usually via api methods which we can proxy if needed,
        // or we just ensure initAuth is called first.
        return undefined;
    }
});

import { headers } from 'next/headers';

export async function verifyAuth() {
    if (siteConfig.localPreviewMode) {
        return createTemplateAdminSession(getAdminEmail());
    }

    const auth = await initAuth();
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session;
}
