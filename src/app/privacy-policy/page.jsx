'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-xl p-8 sm:p-12">
          <header className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Privacy Policy
            </h1>
          </header>

          <div className="prose prose-lg prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information Collection</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect information you provide directly to us when you use our website, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                <li>Name and contact information (email address, phone number)</li>
                <li>Company information (if applicable)</li>
                <li>Inquiry and order details</li>
                <li>Browser and device information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                <li>Process your inquiries and orders</li>
                <li>Improve our products and services</li>
                <li>Send you relevant product information and updates</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Protection</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, use, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar technologies to improve your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-600 leading-relaxed">
                We may use third-party service providers to help us operate our website and business. These third parties may have access to your information only as necessary to perform their functions and are obligated to protect its confidentiality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict our processing of your information</li>
                <li>Withdraw your consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 text-gray-700 space-y-2 border border-gray-100">
                <p><span className="font-semibold">Email:</span> {siteConfig.contactEmail}</p>
                <p><span className="font-semibold">Quick Chat:</span> {siteConfig.whatsappLabel}</p>
                <p><span className="font-semibold">WeChat:</span> {siteConfig.wechatId}</p>
                <p><span className="font-semibold">Address:</span> {siteConfig.addressLines.join(', ')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. Any material changes will be posted on this page and, where appropriate, notified to you by email.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
