'use client';

import { useState } from 'react';
import { Collapse } from 'react-collapse';

export default function FAQAccordion({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  // 防守：如果 faqs 为 undefined 或空，返回空
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-accordion space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="faq-item bg-white rounded-lg border border-gray-300 overflow-hidden"
        >
          {/* Question Button */}
          <button
            className="faq-q w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/30"
            onClick={() => toggleFAQ(index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <span className="font-semibold text-gray-800 text-base pr-4">
              {faq.question}
            </span>
            <svg
              className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Answer Panel */}
          <Collapse isOpened={openIndex === index}>
            <div
              id={`faq-answer-${index}`}
              className="faq-a px-6 py-4 bg-gray-50 text-gray-600 text-[15px] leading-relaxed border-t border-gray-200"
            >
              {faq.answer}
            </div>
          </Collapse>
        </div>
      ))}
    </div>
  );
}
