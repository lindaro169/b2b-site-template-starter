'use client';

/**
 * Analytics 组件
 * 
 * 功能：
 * - GDPR 合规：仅在用户同意 cookie 后加载 GA
 * - SPA 路由跟踪：自动监听路由变化并发送 pageview
 * - Microsoft Clarity 支持（可选）
 */

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { GA_MEASUREMENT_ID, NORMALIZED_GOOGLE_ADS_ID, pageview } from '@/lib/gtag';

interface AnalyticsProps {
    /** Microsoft Clarity Project ID (可选) */
    clarityProjectId?: string;
}

export default function Analytics({ clarityProjectId }: AnalyticsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [hasConsent, setHasConsent] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const primaryGoogleTagId = GA_MEASUREMENT_ID || NORMALIZED_GOOGLE_ADS_ID;

    // 检查 cookie 同意状态
    useEffect(() => {
        const checkConsent = () => {
            const consent = localStorage.getItem('cookie-consent');
            setHasConsent(consent === 'accepted');
        };

        // 初始检查
        checkConsent();

        // 监听 cookie 同意事件（由 CookieConsent 组件触发）
        const handleConsentChange = () => {
            checkConsent();
        };

        window.addEventListener('cookie-consent-updated', handleConsentChange);

        return () => {
            window.removeEventListener('cookie-consent-updated', handleConsentChange);
        };
    }, []);

    // 路由变化时发送 pageview
    useEffect(() => {
        if (!hasConsent || !isLoaded) return;

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        pageview(url);
    }, [pathname, searchParams, hasConsent, isLoaded]);

    // 如果没有任何 Google Tag 或用户未同意，不渲染任何内容
    if (!primaryGoogleTagId || !hasConsent) {
        return null;
    }

    return (
        <>
            {/* Google Analytics */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${primaryGoogleTagId}`}
                onLoad={() => setIsLoaded(true)}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });` : ''}
            ${NORMALIZED_GOOGLE_ADS_ID ? `gtag('config', '${NORMALIZED_GOOGLE_ADS_ID}');` : ''}
          `,
                }}
            />

            {/* Microsoft Clarity (可选) */}
            {clarityProjectId && (
                <Script
                    id="microsoft-clarity"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityProjectId}");
            `,
                    }}
                />
            )}
        </>
    );
}
