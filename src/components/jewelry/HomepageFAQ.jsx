import FAQAccordion from '@/components/FAQAccordion';

export default function HomepageFAQ({ faqs }) {
  const defaultFAQs = [
    {
      question: 'Can I use this site as a starting template?',
      answer: 'Yes. All visible products, company copy, and contact details in this version are placeholder content intended for replacement before publishing.',
    },
    {
      question: 'Why are the product images placeholders?',
      answer: 'The template has been sanitized to remove original client assets. Swap the placeholders with your own approved photography when ready.',
    },
    {
      question: 'Where should I update contact information?',
      answer: 'Start with the site config, environment files, and policy pages before publishing.',
    },
    {
      question: 'Does the template still support custom branding?',
      answer: 'Yes. Replace the demo logo, metadata, catalog copy, and deployment configuration with your production values.',
    },
    {
      question: 'Can I keep the mock catalog for staging?',
      answer: 'Yes. The mock assortment is useful for UI review and stakeholder demos before live data is connected.',
    },
  ];

  const displayFAQs = faqs && faqs.length > 0 ? faqs : defaultFAQs;

  return (
    <section className="py-20 bg-stone-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordion */}
        <FAQAccordion faqs={displayFAQs} />
      </div>
    </section>
  );
}
