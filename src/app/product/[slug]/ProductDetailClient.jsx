'use client';

import { useState } from 'react';
import QuickInquiryModal from '@/components/QuickInquiryModal';
import IconInquiry from '@/components/icons/IconInquiry';

function generateTags(categoryName) {
    const tags = ['#wholesale', '#jewelry', '#crystal'];
    if (categoryName) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        tags.unshift(`#${slug}`);
    }
    return tags;
}

/**
 * Product Detail Client Component
 * 询价按钮 + 标签行（qty 已移入弹窗表单）
 */
export default function ProductDetailClient({ product, categoryName }) {
    const [showInquiry, setShowInquiry] = useState(false);
    const tags = generateTags(categoryName);

    return (
        <>
            {/* Primary CTA: Send Inquiry */}
            <button
                onClick={() => setShowInquiry(true)}
                className="w-full bg-stone-900 hover:bg-primary-600 text-white font-serif font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg mb-3"
            >
                <IconInquiry className="w-5 h-5" />
                Send Inquiry
            </button>

            {/* Secondary: subtle text link */}
            <p className="text-center text-sm text-stone-500 mb-5">
                Or{' '}
                <a href="/contact" className="text-primary-600 hover:text-primary-800 font-medium underline underline-offset-2 transition-colors">
                    contact our sales team
                </a>
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="text-xs text-stone-400 hover:text-primary-600 cursor-pointer transition-colors py-0.5"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Inquiry Modal */}
            {showInquiry && (
                <QuickInquiryModal
                    product={product}
                    onClose={() => setShowInquiry(false)}
                />
            )}
        </>
    );
}
