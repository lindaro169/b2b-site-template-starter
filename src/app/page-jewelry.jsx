import HeroJewelry from "@/components/jewelry/HeroJewelry";
import ProductCategories from "@/components/jewelry/ProductCategories";
import WhyChooseUs from "@/components/jewelry/WhyChooseUs";
import HomepageFAQ from "@/components/jewelry/HomepageFAQ";
import CTABanner from "@/components/jewelry/CTABanner";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `${siteConfig.brandName} | Mock B2B Site Template`,
  description: siteConfig.companyDescription,
  openGraph: {
    title: `${siteConfig.brandName} | Mock B2B Site Template`,
    description: siteConfig.companyDescription,
    type: 'website',
  },
};

export default async function Page() {
  // TODO: Fetch data from Strapi when ready
  // const [categories, testimonials, faqs] = await Promise.all([
  //   fetchProductCategories(),
  //   fetchTestimonials(),
  //   fetchFAQs({ page: 'homepage' })
  // ]);

  const categories = null;
  const testimonials = null;
  const faqs = null;

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
            "url": siteConfig.websiteUrl,
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Demo template contact",
              "url": `${siteConfig.websiteUrl}/contact`
            }
          })
        }}
      />
      <div className="-mt-[69px]">
        <HeroJewelry />
        <ProductCategories categories={categories} />
        <WhyChooseUs testimonials={testimonials} />
        <HomepageFAQ faqs={faqs} />
        <CTABanner />
      </div>
    </>
  );
}
