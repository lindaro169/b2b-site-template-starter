'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductImageGallery({ mainImage, productName }) {
    // Only use mainImage (image_url) — discard old gallery images entirely.
    const validImages = mainImage ? [mainImage] : [];
    const [selectedImage, setSelectedImage] = useState(validImages[0]);

    if (validImages.length === 0) {
        return (
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-sm flex items-center justify-center">
                <span className="text-stone-400 text-lg">No Image Available</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 sticky top-24 self-start">
            {/* Main Image */}
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-sm">
                <Image
                    src={selectedImage}
                    alt={productName}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>

            {/* Thumbnails */}
            {validImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {validImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(img)}
                            className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img
                                ? 'border-primary-600 ring-2 ring-primary-100'
                                : 'border-transparent hover:border-stone-300'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${productName} thumbnail ${index + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
