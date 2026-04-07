import { getProducts } from "@/lib/products";
import { getPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";
import { getAllCategorySlugs } from "@/constants/categoryMapping";

/**
 * 动态生成 sitemap.xml
 * 
 * 包含：首页、产品分类、产品列表、博客、关于我们、联系方式、服务以及所有产品详情页
 * 排除：登录、后台、API 等敏感页面
 */
export default async function sitemap() {
  const BASE_URL = siteConfig.websiteUrl;
  const PLACEHOLDER_LAST_MODIFIED = new Date(siteConfig.placeholderLastModified);

  let posts = [];
  let products = [];

  const [postResult, productResult] = await Promise.all([
    getPosts({ limit: 1000, published: true }),
    getProducts({ limit: 1000, isActive: true }),
  ]);

  if (postResult.success && postResult.data) {
    posts = postResult.data;
  }

  if (productResult.success && productResult.data) {
    products = productResult.data;
  }

  // 博客文章 URL (月更)
  const postUrls = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: PLACEHOLDER_LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // 产品详情页 URL (周更)
  const productUrls = products.map((product) => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: PLACEHOLDER_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 产品分类页
  const categories = getAllCategorySlugs();

  const categoryUrls = categories.map((category) => ({
    url: `${BASE_URL}/products/${category}`,
    lastModified: PLACEHOLDER_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    // 首页 - 最高优先级
    {
      url: BASE_URL,
      lastModified: PLACEHOLDER_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 产品列表概览页
    {
      url: `${BASE_URL}/products`,
      lastModified: PLACEHOLDER_LAST_MODIFIED,
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
      lastModified: PLACEHOLDER_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // 关于我们
    {
      url: `${BASE_URL}/about`,
      lastModified: PLACEHOLDER_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // 联系方式
    {
      url: `${BASE_URL}/contact`,
      lastModified: PLACEHOLDER_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // 服务页面
    {
      url: `${BASE_URL}/services`,
      lastModified: PLACEHOLDER_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // 所有博客文章
    ...postUrls,
  ];
}
