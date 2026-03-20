'use client';

import { useState } from 'react';

const FAQS = [
    {
        q: 'Can I publish these quantities and delivery notes as-is?',
        a: 'No. This section is mock content only. Replace all quantity thresholds, lead times, and qualification rules with approved public information before launch.',
    },
    {
        q: 'Where should I add approved specification details?',
        a: 'Use this FAQ block for final requirements such as dimensions, packaging, fulfillment rules, or support scope after the responsible team signs off.',
    },
    {
        q: 'What should I do with compliance or trust claims?',
        a: 'Keep them generic in staging. Add certifications, guarantees, or compliance wording only after legal and operations approve the exact language.',
    },
    {
        q: 'Is it okay to leave these placeholders in a preview environment?',
        a: 'Yes. A staging or review environment is the right place for placeholder FAQs while final launch content is still being prepared.',
    },
];

export default function FAQSection() {
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <section className="mb-10">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
                Template FAQ Placeholder
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
