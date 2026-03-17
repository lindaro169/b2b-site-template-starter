'use client';

import { useState } from 'react';
import Image from 'next/image';
import TurnstileWidget from './TurnstileWidget';
import { getTrackingPayloadForSubmit } from '@/lib/visitor-tracking';
import { trackGoogleAdsLeadSubmit } from '@/lib/gtag';

export default function QuickInquiryModal({ product, onClose }) {
  // 简化表单 - 仅保留 name, email, message 三个字段
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    quantity: '50 pcs',
    message: `I'm interested in ${product?.title || 'this product'}`,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      const tracking = getTrackingPayloadForSubmit();
      const inquiryData = {
        productId: product.id,
        productName: product.title,
        ...formData,
        turnstileToken,
        tracking,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit inquiry');
      }

      const result = await response.json();
      trackGoogleAdsLeadSubmit({
        leadType: result?.leadType === 'inquiry' ? 'inquiry' : 'contact',
        leadId: result?.id ?? result?.inquiryId,
      });
      console.log('Inquiry submitted successfully:', result);
      setSubmitSuccess(true);

      // 3秒后关闭
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100">

        {/* Header - Premium Stone & Gold */}
        <div className="sticky top-0 bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-serif font-semibold tracking-wide">Quick Inquiry</h2>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Inquiry Submitted Successfully</h3>
              <p className="text-gray-600">Our sales team will contact you shortly</p>
            </div>
          ) : (
            <>
              {/* 产品信息摘要 */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                <div className="flex gap-3">
                  {product?.featuredImage?.url && (
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={product.featuredImage.url}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {product?.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form - Simplified */}
              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    ❌ {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Estimated Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estimated Quantity
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 50 pcs, 100 pcs/style"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Please enter your inquiry..."
                  />
                </div>

                {/* Turnstile Widget */}
                <div style={{
                  marginTop: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: '60px'
                }}>
                  <TurnstileWidget
                    containerId="cf-turnstile-inquiry"
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setError('');
                      console.log('✅ Turnstile verified for inquiry');
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
                    size="compact"
                  />
                </div>

                {/* Submit Button - Premium */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-stone-900 hover:bg-primary-600 disabled:bg-stone-300 text-white font-serif font-semibold py-3.5 rounded-lg transition-all duration-300 mt-4 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We will reply within 24 hours
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
