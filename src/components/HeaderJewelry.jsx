'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { siteConfig } from '@/lib/site-config';

export default function HeaderJewelry() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [productsMobileDropdownOpen, setProductsMobileDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    {
      name: 'Products',
      href: '/products',
      dropdown: [
        {
          name: 'Quartz Capsule Line',
          href: '/products/healing-crystal-jewelry',
          subItems: [
            { name: 'Bracelet Mockups', href: '/products/healing-crystal-jewelry/bracelets' },
            { name: 'Pendant Mockups', href: '/products/healing-crystal-jewelry/necklaces' },
          ]
        },
        {
          name: 'Silver Studio Line',
          href: '/products/925-silver-crystal-jewelry',
          subItems: [
            { name: 'Bracelet Mockups', href: '/products/925-silver-crystal-jewelry/bracelets' },
            { name: 'Pendant Mockups', href: '/products/925-silver-crystal-jewelry/necklaces' },
          ]
        },
        {
          name: 'Mindful Ritual Edit',
          href: '/products/chakra-yoga-jewelry',
          subItems: [
            { name: 'Bracelet Mockups', href: '/products/chakra-yoga-jewelry/bracelets' },
            { name: 'Pendant Mockups', href: '/products/chakra-yoga-jewelry/necklaces' },
          ]
        },
        {
          name: 'Aroma Companion Series',
          href: '/products/aromatherapy-jewelry',
          subItems: [
            { name: 'Charm Mockups', href: '/products/aromatherapy-jewelry/bracelets' },
            { name: 'Capsule Mockups', href: '/products/aromatherapy-jewelry/necklaces' },
          ]
        },
      ]
    },
    { name: 'Services', href: '/services' },
    { name: 'About Template', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src={siteConfig.logoPath}
                alt="Template placeholder logo"
                width={180}
                height={60}
                className="w-44 h-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              item.dropdown ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setProductsDropdownOpen(true)}
                  onMouseLeave={() => setProductsDropdownOpen(false)}
                >
                  {/* Products Link - Can be clicked to navigate */}
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                  >
                    {item.name}
                    <ChevronDownIcon
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${productsDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  {productsDropdownOpen && (
                    <div className="absolute left-0 mt-0 w-80 rounded-lg shadow-xl shadow-stone-200 bg-white ring-1 ring-black ring-opacity-5 py-2 z-40 border-t-2 border-primary-600">
                      {item.dropdown.map((category) => (
                        <div key={category.name} className="px-4 py-2">
                          <Link
                            href={category.href}
                            className="block text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2"
                          >
                            {category.name}
                          </Link>
                          {category.subItems && category.subItems.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {category.subItems.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="block text-xs text-stone-500 hover:text-primary-600 transition-colors py-1"
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex md:items-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-2 bg-stone-900 text-white font-serif tracking-wide rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-sm"
            >
              {siteConfig.catalogCta}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div key={item.name}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className="flex-1 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() =>
                          setProductsMobileDropdownOpen(!productsMobileDropdownOpen)
                        }
                        className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${productsMobileDropdownOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>
                    </div>
                    {productsMobileDropdownOpen && (
                      <div className="pl-4 space-y-1 bg-gray-50 rounded-lg p-2 mt-1">
                        {item.dropdown.map((category) => (
                          <div key={category.name} className="space-y-1">
                            <Link
                              href={category.href}
                              className="block px-3 py-2 text-sm font-semibold text-gray-900 hover:text-primary-600"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setProductsMobileDropdownOpen(false);
                              }}
                            >
                              {category.name}
                            </Link>
                            {category.subItems && category.subItems.length > 0 && (
                              <div className="pl-4 space-y-1">
                                {category.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className="block px-3 py-1.5 text-xs text-gray-600 hover:text-primary-600"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setProductsMobileDropdownOpen(false);
                                    }}
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <Link
                href="/contact"
                className="block w-full px-3 py-2 mt-4 bg-primary-600 text-white text-center font-semibold rounded-lg hover:bg-primary-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {siteConfig.catalogCta}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
