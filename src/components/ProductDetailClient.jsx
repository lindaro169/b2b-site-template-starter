'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductDetailClient({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(product.moq || 50);

  const gallery = product.gallery || [product.featuredImage];

  return (
    <>
      {/* Image Gallery */}
      <div className="space-y-4 sticky top-24 self-start">
        {/* Main Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-stone-100">
          <Image
            src={gallery[selectedImage]?.url || product.featuredImage.url}
            alt={gallery[selectedImage]?.alt || 'Product image'}
            fill
            className="object-cover"
          />
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-4 gap-4">
          {gallery.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative rounded-lg overflow-hidden transition-all duration-200 ${selectedImage === index ? 'ring-2 ring-primary-600 shadow-md transform scale-105' : 'ring-1 ring-gray-200 hover:ring-primary-300'
                }`}
            >
              <Image
                src={image?.url || image}
                alt={image?.alt || `View ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-4 leading-tight">{product.title}</h1>
          <p className="text-lg text-stone-600 leading-relaxed mb-6">{product.excerpt}</p>

          {/* Product Highlights / Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200">
              <span className="text-stone-500">💎</span> Natural Crystal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200">
              <span className="text-stone-500">✨</span> 925 Sterling Silver
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium border border-primary-100">
              <span className="text-primary-500">🛡️</span> Ethical Sourcing
            </span>
          </div>
        </div>

        {/* MOQ Information */}
        <div className="bg-gradient-to-r from-primary-50 to-stone-50 border border-primary-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-stone-800">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-serif font-semibold text-lg">Minimum Order Quantity: <span className="text-primary-700">{product.moq} pieces</span></span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-stone-500 uppercase tracking-wide">
            Inquiry Quantity (min {product.moq})
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(product.moq, quantity - 10))}
              className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
              className="w-24 px-4 py-2 border border-stone-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min={product.moq}
            />
            <button
              onClick={() => setQuantity(quantity + 10)}
              className="w-10 h-10 flex items-center justify-center border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4">
          <Link
            href="/contact"
            className="block w-full bg-stone-900 hover:bg-primary-600 text-white text-center px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            Request Quote for {quantity} Units
          </Link>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div >
    </>
  );
}
