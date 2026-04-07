'use client';

/**
 * Cookie Consent Banner
 * 
 * GDPR 合规的 Cookie 同意横幅
 * - 用户可以接受或拒绝 cookie
 * - 状态保存在 localStorage
 * - 触发自定义事件通知 Analytics 组件
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // 检查是否已经做出选择
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowBanner(false);

        // 触发事件通知 Analytics 组件
        window.dispatchEvent(new Event('cookie-consent-updated'));
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setShowBanner(false);

        // 触发事件通知 Analytics 组件
        window.dispatchEvent(new Event('cookie-consent-updated'));
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-300">
                    <p>
                        We use cookies to improve your browsing experience and analyze website traffic.
                        By continuing to use this site, you agree to our{' '}
                        <Link href="/privacy-policy" className="underline hover:text-white">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
