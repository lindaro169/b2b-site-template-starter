import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import FAQAccordion from '@/components/FAQAccordion';
import TemplateCopyBadge from '@/components/TemplateCopyBadge';
import IconMOQ from '@/components/icons/IconMOQ';
import IconCertified from '@/components/icons/IconCertified';
import IconFastShip from '@/components/icons/IconFastShip';
import { siteConfig } from '@/lib/site-config';

export const metadata = {
  title: `Template Services — ${siteConfig.brandName}`,
  description: 'Mock services page for reviewing layout, process copy, and CTA structure before launch.',
};

const services = [
  {
    icon: IconMOQ,
    title: 'Placeholder Offer Stack',
    description: 'Use this block to describe your primary service package, entry point, or qualification model.',
  },
  {
    icon: IconCertified,
    title: 'Brand & Packaging Module',
    description: 'Swap in the customization, approval, or fulfillment services your team actually provides.',
  },
  {
    icon: IconFastShip,
    title: 'Delivery Promise Placeholder',
    description: 'This is where your fulfillment timeline, region coverage, or onboarding SLA can live.',
  },
];

const processSteps = [
  {
    step: '1',
    title: 'Brief',
    description: 'Collect the minimum information your team needs to qualify the request.',
  },
  {
    step: '2',
    title: 'Review',
    description: 'Validate scope, pricing, or content requirements before work moves forward.',
  },
  {
    step: '3',
    title: 'Build',
    description: 'Describe the internal or client-facing production phase relevant to your offer.',
  },
  {
    step: '4',
    title: 'Launch',
    description: 'Explain the handoff, shipping, or go-live path that applies after approval.',
  },
];

const faqs = [
  {
    question: 'Can I rewrite this services page completely?',
    answer: 'Yes. The current copy is intentionally generic so you can replace it with your own process, terms, and service lines.',
  },
  {
    question: 'Should I keep the four-step process?',
    answer: 'Only if it matches your buyer journey. The structure is optional; the section is here to demonstrate layout patterns.',
  },
  {
    question: 'Where do I add approved certifications or SLAs?',
    answer: 'Use the trust band and FAQ section once legal and ops have confirmed the wording.',
  },
  {
    question: 'Can I reuse this page for a different service model?',
    answer: 'Yes. The structure is generic enough for onboarding, production, procurement, and fulfillment offers.',
  },
  {
    question: 'Are the current numbers real?',
    answer: 'No. Treat every metric on this page as placeholder content until you replace it.',
  },
  {
    question: 'Can this page stay in staging with mock content?',
    answer: 'Yes. That is the safest way to review design and flow before production content is introduced.',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-stone-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-noise.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <TemplateCopyBadge className="mb-6" />
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-8 leading-tight">
              Replaceable Template Service Blocks
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-10 font-light">
              {siteConfig.templateCopyDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/contact?type=template-review"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 transition-all shadow-lg hover:shadow-primary-600/30 hover:-translate-y-1"
              >
                Review Contact Template
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-stone-600 text-stone-300 font-semibold rounded-lg hover:bg-white/5 hover:text-white hover:border-white transition-all"
              >
                Open Template Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Template Service Blocks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Example Process Layout
            </h2>
            <p className="text-gray-600">Use this section to map your approved buyer journey before launch.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Replaceable Detail Blocks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Customization</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Swap in your real deliverable or package scope
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Add optional upgrades or approval checkpoints
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Describe customization levers that matter to buyers
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Call out packaging, QA, or compliance work if relevant
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Template Notes</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Replace each line item with an approved promise
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Keep mock copy in staging only
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verify legal language before production launch
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Remove placeholder references once real assets are ready
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Trust & Proof Placeholder
            </h2>
            <p className="text-gray-600">Use this band for real proof only after it has been approved for publication.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-primary-600 min-w-[200px] text-center">
              <div className="text-3xl mb-2">✓</div>
              <h3 className="font-bold text-gray-900">Approved Proof Point</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-primary-600 min-w-[200px] text-center">
              <div className="text-3xl mb-2">✓</div>
              <h3 className="font-bold text-gray-900">Operational Guarantee</h3>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* CTA Banner - Unified Stone Theme */}
      <section className="py-20 bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
            Ready to Replace the Demo Offer?
          </h2>
          <p className="text-lg text-stone-300 mb-10 font-light">
            Add your real service scope, team promises, and qualification rules here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-serif font-semibold rounded-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-primary-100/20"
          >
            {siteConfig.catalogCta}
          </Link>
        </div>
      </section>
    </>
  );
}
