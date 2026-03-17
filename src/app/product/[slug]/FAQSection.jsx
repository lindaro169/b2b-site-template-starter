'use client';

import { useState } from 'react';

const FAQS = [
    {
        q: 'What is the minimum order quantity?',
        a: 'For our ready stock styles, the minimum is 5 pcs per style — you are welcome to mix different styles in one order. For custom style production (your own design / OEM), the minimum is 50 pcs per style.',
    },
    {
        q: 'Can you do OEM / custom style production?',
        a: 'Yes! If you have your own jewelry design or want us to produce an exclusive style for your brand, we offer OEM production with a minimum of 50 pcs per style. We can also assist with design adjustments, material selection, and sampling before bulk production.',
    },
    {
        q: 'Do you provide product certifications?',
        a: 'Yes. We offer 925 Sterling Silver Certification and Natural Crystal Certification for applicable products. These are available upon request — please mention it when you send your inquiry.',
    },
    {
        q: 'What is the lead time?',
        a: 'Ready stock items ship within 3–5 business days. OEM / custom style orders typically take 15–20 business days after order confirmation and deposit payment.',
    },
];

export default function FAQSection() {
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <section className="mb-10">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
                Frequently Asked Questions
            </h2>
            <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                {FAQS.map((faq, i) => (
                    <div key={i}>
                        <button
                            onClick={() => setOpenIdx(openIdx === i ? null : i)}
                            className="w-full text-left px-5 py-4 flex items-center justify-between text-stone-800 font-medium hover:bg-stone-50 transition-colors text-base"
                            aria-expanded={openIdx === i}
                        >
                            <span>{faq.q}</span>
                            <span className="ml-4 text-stone-400 flex-shrink-0 text-xl leading-none">
                                {openIdx === i ? '−' : '+'}
                            </span>
                        </button>
                        {openIdx === i && (
                            <div className="px-5 pb-5 pt-1 text-stone-600 text-base leading-relaxed bg-stone-50 border-t border-stone-100">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
