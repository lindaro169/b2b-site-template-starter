/**
 * Google Analytics 工具函数
 * 
 * 提供 GA4 页面浏览和自定义事件跟踪功能
 */

// GA Measurement ID - 从环境变量获取
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';
export const GOOGLE_ADS_INQUIRY_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_INQUIRY_LABEL || '';

// 扩展 Window 类型以支持 gtag
declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        dataLayer: unknown[];
    }
}

/**
 * 发送页面浏览事件
 * @param url - 当前页面 URL
 */
export const pageview = (url: string): void => {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};

function normalizeGoogleAdsId(id: string): string {
    if (!id) {
        return '';
    }

    return id.startsWith('AW-') ? id : `AW-${id}`;
}

export const NORMALIZED_GOOGLE_ADS_ID = normalizeGoogleAdsId(GOOGLE_ADS_ID);

export function isGoogleAdsLeadTrackingEnabled(): boolean {
    return Boolean(NORMALIZED_GOOGLE_ADS_ID && GOOGLE_ADS_INQUIRY_LABEL);
}

/**
 * 发送自定义事件
 * @param action - 事件动作 (e.g., 'click', 'submit')
 * @param category - 事件类别 (e.g., 'engagement', 'form')
 * @param label - 事件标签 (可选)
 * @param value - 事件值 (可选)
 */
export const event = ({
    action,
    category,
    label,
    value,
}: {
    action: string;
    category: string;
    label?: string;
    value?: number;
}): void => {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

/**
 * 常用事件快捷方法
 */
export const trackEvent = {
    // 点击联系按钮
    contactClick: () => event({ action: 'click', category: 'contact', label: 'contact_button' }),

    // 提交询价表单
    inquirySubmit: (productId?: string) =>
        event({ action: 'submit', category: 'inquiry', label: productId }),

    // 查看产品详情
    productView: (productSlug: string) =>
        event({ action: 'view', category: 'product', label: productSlug }),

    // 下载目录
    catalogDownload: () => event({ action: 'download', category: 'catalog' }),

    // 博客文章阅读
    blogRead: (postSlug: string) =>
        event({ action: 'read', category: 'blog', label: postSlug }),
};

export function trackGoogleAdsLeadSubmit(params?: {
    leadType?: 'contact' | 'inquiry';
    leadId?: string | number | null;
    value?: number;
    currency?: string;
}): void {
    if (
        typeof window === 'undefined' ||
        !window.gtag ||
        !NORMALIZED_GOOGLE_ADS_ID ||
        !GOOGLE_ADS_INQUIRY_LABEL
    ) {
        return;
    }

    const transactionId =
        params?.leadId !== undefined && params?.leadId !== null
            ? `${params?.leadType || 'lead'}-${String(params.leadId)}`
            : undefined;

    window.gtag('event', 'conversion', {
        send_to: `${NORMALIZED_GOOGLE_ADS_ID}/${GOOGLE_ADS_INQUIRY_LABEL}`,
        value: params?.value ?? 1,
        currency: params?.currency ?? 'USD',
        transaction_id: transactionId,
    });
}
