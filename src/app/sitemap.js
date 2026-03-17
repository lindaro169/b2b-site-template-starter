import { fetchPostSitemap } from "@/lib/api";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";

/**
 * 动态生成 sitemap.xml
 * 
 * 包含：首页、产品分类、产品列表、博客、关于我们、联系方式、服务以及所有产品详情页
 * 排除：登录、后台、API 等敏感页面
 */
export default async function sitemap() {
  const BASE_URL = process.env.NEXT_PUBLIC_WEBSITE || siteConfig.websiteUrl;

  let posts = [];
  let products = [];

  try {
    // 获取所有博客文章
    const postData = await fetchPostSitemap();
    posts = postData || [];

    // 获取所有已发布产品
    const productsData = await getProducts({ limit: 1000, published: true });
    if (productsData.success && productsData.data) {
      products = productsData.data;
    }
  } catch (error) {
    console.error('Sitemap fetch error:', error.message);
  }

  // 博客文章 URL (月更)
  const postUrls = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // 产品详情页 URL (周更)
  const productUrls = products.map((product) => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 产品分类页
  const categories = [
    'healing-crystal-jewelry',
    '925-silver-crystal-jewelry',
    'chakra-yoga-jewelry',
    'aromatherapy-jewelry',
  ];

  const categoryUrls = categories.map((category) => ({
    url: `${BASE_URL}/products/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    // 首页 - 最高优先级
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 产品列表概览页
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // 所有产品详情页
    ...productUrls,
    // 产品分类页
    ...categoryUrls,
    // 博客列表页
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // 关于我们
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // 联系方式
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // 服务页面
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // 所有博客文章
    ...postUrls,
    // 隐私政策和条款 - 低优先级
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
