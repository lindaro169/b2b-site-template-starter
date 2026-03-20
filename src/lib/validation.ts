import { siteConfig } from './site-config';

export interface TurnstileVerifyResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    error_codes?: string[];
    'error-codes'?: string[];
}

/**
 * Verify Cloudflare Turnstile token
 *
 * @param token - The Turnstile response token from client
 * @param secretKey - TURNSTILE_SECRET_KEY from environment
 * @returns Verification result with success flag
 */
export async function verifyTurnstileToken(
    token: string,
    secretKey: string
): Promise<TurnstileVerifyResponse> {
    if (siteConfig.templateMode && token === siteConfig.templateTurnstileToken) {
        return { success: true };
    }

    if (!token || !secretKey) {
        return {
            success: false,
            'error-codes': ['missing_token_or_key'],
        };
    }

    // Bypass for testing
    if (token === 'test-turnstile-token' && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
        return { success: true };
    }

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: secretKey,
                response: token,
            }),
        });

        if (!response.ok) {
            return {
                success: false,
                'error-codes': ['verification_failed'],
            };
        }

        const data = await response.json() as TurnstileVerifyResponse;
        return data;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return {
            success: false,
            'error-codes': ['verification_error'],
        };
    }
}

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
