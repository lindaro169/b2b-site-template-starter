import Link from 'next/link';
import TestimonialCard from '@/components/TestimonialCard';
import TemplateCopyBadge from '@/components/TemplateCopyBadge';
import { siteConfig } from '@/lib/site-config';

export const metadata = {
  title: `About This Template — ${siteConfig.brandName}`,
  description: 'Sanitized demo company profile for a reusable wholesale jewelry storefront.',
};

const stats = [
  { value: '4', label: 'Demo Category Lines' },
  { value: '8', label: 'Mock Products' },
  { value: '1', label: 'Template Brand Layer' },
  { value: '100%', label: 'Placeholder Assets' },
];

const testimonials = [
  {
    clientName: 'Sarah M.',
    clientCompany: 'Studio Preview Team',
    clientLocation: 'Remote',
    role: 'Reviewer',
    quote: 'This sanitized profile page made it easy to validate spacing, sections, and proof points before adding production content.',
  },
  {
    clientName: 'Thomas B.',
    clientCompany: 'Merch Ops Sandbox',
    clientLocation: 'Internal',
    role: 'Approver',
    quote: 'The mock narrative gave us a safe baseline for stakeholder review without exposing customer names or business metrics.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-stone-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-noise.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <TemplateCopyBadge className="mb-6" />
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-8 leading-tight">
              About This Template Placeholder
            </h1>
            <p className="text-xl text-stone-300 leading-relaxed mb-10 font-light">
              {siteConfig.templateCopyDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 transition-all shadow-lg hover:shadow-primary-600/30 hover:-translate-y-1"
              >
                Open Contact Template
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-stone-600 text-stone-300 font-semibold rounded-lg hover:bg-white/5 hover:text-white hover:border-white transition-all"
              >
                {siteConfig.catalogCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            Placeholder Story Block
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              This page intentionally uses placeholder copy. Replace the story, milestones, and trust signals with facts that have been approved for public release.
            </p>
            <p>
              The structure is already ready for typical B2B storytelling: origin story, proof points, differentiators, and trust-building testimonials.
            </p>
            <p>
              Keep this sanitized version for staging, QA, and internal review. Swap in production copy only after legal, merchandising, and leadership approval.
            </p>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            Example Use Case
          </h2>
            <div className="bg-gradient-to-br from-primary-50 to-secondary/10 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Example: How Teams Review the Template
              </h3>
              <p className="text-gray-700 mb-4">
                Product, content, and growth teams often need a working storefront before live catalog assets are ready. This mock version gives them a safe environment to review navigation, content rhythm, and conversion surfaces.
              </p>
              <p className="text-gray-700 mb-4">
                Once approval is complete, the placeholder sections can be swapped for real photography, buyer proof points, and market-specific positioning.
              </p>
              <p className="text-gray-700 font-medium">
                &quot;Use the template to validate structure first. Add real proof only when it has been cleared for publication.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            Replaceable Value Blocks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600">
                Keep the layout polished while holding back real operational details until launch readiness.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Success</h3>
              <p className="text-gray-600">
                Use mock proof points to test hierarchy, iconography, and section density before adding real case studies.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                Swap this copy with your own differentiators when the product, legal, and brand teams sign off.
              </p>
            </div>
          </div>

          {/* Certifications */}
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-8">Placeholder Trust Signals</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white px-8 py-4 rounded-full border border-primary-200 shadow-sm text-primary-900 font-semibold flex items-center gap-3 hover:shadow-md transition-shadow">
                <span className="text-2xl">✦</span> Demo Proof Placeholder
              </div>
              <div className="bg-white px-8 py-4 rounded-full border border-stone-200 shadow-sm text-stone-700 font-semibold flex items-center gap-3 hover:shadow-md transition-shadow">
                <span className="text-2xl">⚑</span> Replace Before Launch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            Placeholder Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-noise.png')] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
            Ready to Replace the Demo Story?
          </h2>
          <p className="text-xl text-stone-300 mb-10">
            Add approved milestones, customer proof, and leadership positioning here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 transition-all shadow-lg hover:shadow-primary-600/30 hover:-translate-y-1"
          >
            Open Contact Template
          </Link>
        </div>
      </section>
    </>
  );
}
