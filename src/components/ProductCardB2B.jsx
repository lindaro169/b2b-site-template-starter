'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import QuickInquiryModal from './QuickInquiryModal';
import IconInquiry from './icons/IconInquiry';
import { siteConfig } from '@/lib/site-config';

export default function ProductCard({ product }) {
  const [showInquiry, setShowInquiry] = useState(false);

  if (!product) return null;

  const {
    slug,
    title,
    excerpt,
    description,
    featuredImage,
  } = product;
  const imageUrl = featuredImage?.url || siteConfig.productPlaceholder;
  const imageAlt = featuredImage?.alt || `${title} placeholder image`;
  const summaryText =
    excerpt ||
    description ||
    'Placeholder product copy for template preview. Replace this text before publishing.';

  // MOQ is available in product data; kept for potential UI decisions

  return (
    <>
      <div className="bg-white rounded-xl border border-stone-200 hover:border-primary-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden h-full flex flex-col group relative">

        {/* 产品图片部分 */}
        <Link href={`/product/${slug}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100 group cursor-pointer">
            {/* 产品图片 */}
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              unoptimized
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px"
            />
          </div>
        </Link>

        {/* 产品信息部分 - 简化版本 */}
        <div className="flex-1 p-5 flex flex-col">

          {/* 产品名称 */}
          <Link href={`/product/${slug}`}>
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer">
              {title}
            </h3>
          </Link>

          {/* 产品描述 */}
          <p className="text-sm text-stone-500 mb-4 line-clamp-2 leading-relaxed">
            {summaryText}
          </p>

          {/* 快速操作按钮 */}
          <div className="mt-auto space-y-2 flex flex-col">
            {/* Send Inquiry Button */}
            <button
              onClick={() => setShowInquiry(true)}
              className="w-full bg-stone-900 hover:bg-primary-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <IconInquiry className="w-4 h-4" />
              <span>Open Template Inquiry</span>
            </button>

            {/* View Details Button */}
            {/* View Details Button */}
            <Link
              href={`/product/${slug}`}
              className="w-full bg-white hover:bg-primary-50 text-stone-600 hover:text-primary-600 hover:border-primary-200 font-medium py-2.5 px-4 rounded-lg border border-stone-200 transition-colors duration-200 text-sm flex items-center justify-center"
            >
              Open Details
            </Link>
          </div>
        </div>
      </div>

      {/* 快速询盘弹窗 */}
      {showInquiry && (
        <QuickInquiryModal
          product={product}
          onClose={() => setShowInquiry(false)}
        />
      )}
    </>
  );
}
