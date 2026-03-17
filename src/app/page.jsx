import HeroJewelry from "@/components/jewelry/HeroJewelry";
import FeaturedProducts from "@/components/jewelry/FeaturedProducts";
import ProductCategories from "@/components/jewelry/ProductCategories";
import WhyChooseUs from "@/components/jewelry/WhyChooseUs";
import HomepageFAQ from "@/components/jewelry/HomepageFAQ";
import CTABanner from "@/components/jewelry/CTABanner";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `${siteConfig.brandName} | Mock Wholesale Jewelry Template`,
  description: siteConfig.companyDescription,
  openGraph: {
    title: `${siteConfig.brandName} | Mock Wholesale Jewelry Template`,
    description: siteConfig.companyDescription,
    type: 'website',
  },
};

import { getCategories } from "@/lib/categories";
import { getTestimonials } from "@/lib/testimonials";
import { getFAQs } from "@/lib/faqs";

export default async function Page() {
  const [categoriesData, testimonialsData, faqsData] = await Promise.all([
    getCategories(),
    getTestimonials(),
    getFAQs()
  ]);

  const categories = categoriesData.success ? categoriesData.data : [];
  const testimonials = testimonialsData.success ? testimonialsData.data : [];
  const faqs = faqsData.success ? faqsData.data : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteConfig.brandName,
            "description": siteConfig.companyDescription,
            "url": process.env.NEXT_PUBLIC_WEBSITE || siteConfig.websiteUrl,
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Demo template contact",
              "url": `${process.env.NEXT_PUBLIC_WEBSITE || siteConfig.websiteUrl}/contact`
            }
          })
        }}
      />
      <div className="-mt-[69px]">
        <HeroJewelry />
        <FeaturedProducts />
        <ProductCategories categories={categories} />
        <WhyChooseUs testimonials={testimonials} />
        <HomepageFAQ faqs={faqs} />
        <CTABanner />
      </div>
    </>
  );
}
