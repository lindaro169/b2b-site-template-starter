'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './featured-products.module.css';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=10&sortBy=createdAt&sortOrder=desc');

        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }

        const data = await response.json();
        if (data.success && data.data) {
          // Only show products that have an image
          const withImages = data.data.filter(p => p.imageUrl);
          setProducts(withImages.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Featured Template Entries</h2>
            <p className={styles.subtitle}>
              Review placeholder cards, imagery, and copy structure before loading approved catalog content
            </p>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading placeholder entries...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Featured Template Entries</h2>
            <p className={styles.subtitle}>
              Review placeholder cards, imagery, and copy structure before loading approved catalog content
            </p>
          </div>
          <div className={styles.errorContainer}>
            <p>Unable to load placeholder entries. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Template Entries</h2>
          <p className={styles.subtitle}>
            Review placeholder cards, imagery, and copy structure before loading approved catalog content
          </p>
        </div>

        {/* Product Grid */}
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              {/* Product Image */}
              <Link href={`/product/${product.slug}`}>
                <div className={styles.imageWrapper}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className={styles.image}
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px"
                    />
                  ) : (
                    <div className={styles.noImage}>
                      <span>No Image</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className={styles.content}>
                {/* Product Name */}
                <Link href={`/product/${product.slug}`}>
                  <h3 className={styles.productName}>{product.name}</h3>
                </Link>

                {/* Product Description */}
                <p className={styles.description}>
                  {product.excerpt || product.description}
                </p>

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <Link href={`/product/${product.slug}`}>
                    <button className={styles.viewDetailsBtn}>
                      Open Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className={styles.cta}>
          <Link href="/products">
            <button className={styles.viewAllBtn}>
              View All Template Entries →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
