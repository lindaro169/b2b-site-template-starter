'use client';

import { useState } from 'react';
import Link from 'next/link';
import TurnstileWidget from '@/components/TurnstileWidget';
import TemplateCopyBadge from '@/components/TemplateCopyBadge';
import { siteConfig } from '@/lib/site-config';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Check Turnstile token
    if (!turnstileToken) {
      setError('请完成人类验证 (Please complete the verification)');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstile_token: turnstileToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      await response.json();
      console.log('Message sent successfully');
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTurnstileToken('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Template Contact</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-stone-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-noise.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <TemplateCopyBadge className="mb-6" />
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6 leading-tight">
              Contact Template Placeholder
            </h1>
            <p className="text-xl text-stone-300 font-light">
              {siteConfig.templateCopyDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                Send a Placeholder Message
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  Placeholder submission received. Replace this confirmation with your real SLA and next-step messaging.
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the approved contact workflow you want to support after launch..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                {/* Turnstile Widget */}
                <div>
                  <TurnstileWidget
                    containerId="cf-turnstile-contact"
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      console.log('✅ Turnstile verified for contact');
                    }}
                    onError={() => {
                      setError('验证失败，请重试 (Verification failed, please try again)');
                      setTurnstileToken('');
                      console.log('❌ Turnstile error');
                    }}
                    onExpire={() => {
                      setError('验证已过期，请重新验证 (Verification expired, please re-verify)');
                      setTurnstileToken('');
                      console.log('⏱ Turnstile expired');
                    }}
                    theme="light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
                  className="w-full px-8 py-4 bg-stone-900 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Template Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                Placeholder Contact Information
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary-600 hover:text-primary-700">
                      {siteConfig.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Template Chat</h3>
                    <p className="text-primary-600">{siteConfig.whatsappLabel}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">WeChat</h3>
                    <p className="text-gray-600">{siteConfig.wechatId}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      {siteConfig.addressLines[0]}<br />
                      {siteConfig.addressLines[1]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Placeholder Availability</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template Hours:</span>
                    <span className="text-gray-900 font-medium">{siteConfig.businessHours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            Common Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                How quickly do you respond?
              </summary>
              <p className="mt-3 text-gray-600">
                This is placeholder messaging. Define your real SLA, escalation path, and owner before publishing.
              </p>
            </details>
            <details className="bg-white rounded-lg p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I request a pilot or demo?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes. Use this slot for pilot, demo, intake, or routing instructions once your team has finalized the real workflow.
              </p>
            </details>
            <details className="bg-white rounded-lg p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What payment methods do you accept?
              </summary>
              <p className="mt-3 text-gray-600">
                Replace this block with the payment methods and approval rules that apply to your business. Do not ship this demo copy to production.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
