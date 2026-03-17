'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Terms & Conditions</span>
          </nav>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-xl p-8 sm:p-12">
          <header className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Please read these terms carefully before using our website and services.
            </p>
          </header>

          <div className="prose prose-lg prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Company Information</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-gray-700 space-y-2 border border-gray-100">
                <p><span className="font-semibold">Company Name:</span> {siteConfig.legalName}</p>
                <p><span className="font-semibold">Address:</span> {siteConfig.addressLines.join(', ')}</p>
                <p><span className="font-semibold">Email:</span> {siteConfig.contactEmail}</p>
                <p><span className="font-semibold">Quick Chat:</span> {siteConfig.whatsappLabel}</p>
                <p><span className="font-semibold">WeChat:</span> {siteConfig.wechatId}</p>
                <p><span className="font-semibold">Website:</span> {siteConfig.websiteHost}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {siteConfig.brandName} is a placeholder identity used for demo and staging environments. Replace every service statement below with approved production language before launch. Suggested sections include:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                <li>What you sell or deliver</li>
                <li>Which buyers or markets you serve</li>
                <li>Any approval-dependent custom work</li>
                <li>Fulfillment, support, or onboarding scope</li>
                <li>Any exclusions or channel limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Order and Payment Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Commercial Terms:</strong> Replace with your own deposit, invoice, and approval rules.
                </p>
                <p>
                  <strong>Payment Methods:</strong> List only the methods your finance team has approved.
                </p>
                <div>
                  <strong>Payment Terms:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Order threshold rules</li>
                    <li>Deposit and milestone timing</li>
                    <li>Refund or cancellation windows</li>
                    <li>Any geography-specific restrictions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Delivery and Shipping</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Delivery Time:</strong> Add your real SLA only after operations approves it.
                </p>
                <p>
                  <strong>Shipping Options:</strong> Replace with the carriers or launch paths your team actually supports.
                </p>
                <p>
                  <strong>Responsibility:</strong> Clarify transfer of risk and handoff ownership with legal review.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Quality Assurance</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace this paragraph with the quality, compliance, or service language that accurately reflects your business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Sample Service</h2>
              <p className="text-gray-600 leading-relaxed">
                Use this section for trials, pilots, sampling, or discovery engagements if relevant. Remove it if your business does not offer them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Customization and OEM Services</h2>
              <p className="text-gray-600 leading-relaxed">
                If you support customization or bespoke work, outline the real approval requirements here:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                <li>Brief or specification requirements</li>
                <li>Approval gates or minimums</li>
                <li>Development or setup fees</li>
                <li>Extended timelines, if any</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Returns and Refunds</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace with your actual returns, service credit, or escalation policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace with your approved intellectual-property language before publishing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace this with legal counsel-approved liability wording.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace with the governing law and dispute process that applies to your operating entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Communication</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace this section with your real support hours, escalation paths, and response commitments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications</h2>
              <p className="text-gray-600 leading-relaxed">
                Replace with the update notice process approved by legal and operations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                For questions about these terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 text-gray-700 space-y-2 border border-gray-100">
                <p><span className="font-semibold">Email:</span> {siteConfig.contactEmail}</p>
                <p><span className="font-semibold">Quick Chat:</span> {siteConfig.whatsappLabel}</p>
                <p><span className="font-semibold">WeChat:</span> {siteConfig.wechatId}</p>
                <p><span className="font-semibold">Website:</span> {siteConfig.websiteHost}</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
