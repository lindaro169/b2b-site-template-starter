'use client';

import Link from 'next/link';

export default function WhatsAppButton() {
    return (
        <Link
            href="/contact"
            aria-label="Open quick inquiry"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-stone-900 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
            <span className="max-w-0 overflow-hidden group-hover:max-w-[140px] transition-all duration-300 text-sm font-medium whitespace-nowrap pl-0 group-hover:pl-4">
                Quick Inquiry
            </span>

            <span className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M6 7.5h12M6 12h8M6 16.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M20 12c0 4.418-3.582 8-8 8a8.97 8.97 0 0 1-3.805-.832L4 20l.832-4.195A8.97 8.97 0 0 1 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
            </span>
        </Link>
    );
}
