import { siteConfig } from '@/lib/site-config';

export async function GET() {
    const baseUrl = siteConfig.websiteUrl

    const robotsTxt = `# robots.txt
# ==========================================
# 默认规则（所有爬虫）
# ==========================================
User-agent: *
Allow: /
Allow: /products
Allow: /blog
Allow: /about
Allow: /contact
Allow: /services
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*
Disallow: /_next/
Disallow: /private/

# ==========================================
# AI 爬虫专用规则
# ==========================================
# OpenAI GPTBot
User-agent: GPTBot
Allow: /
Allow: /products
Allow: /blog
Allow: /about
Allow: /contact
Allow: /services
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*
Disallow: /privacy-policy
Disallow: /terms-conditions

# Google AI (Bard/Gemini)
User-agent: Google-Extended
Allow: /
Allow: /products
Allow: /blog
Allow: /about
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*

# Anthropic Claude
User-agent: anthropic-ai
Allow: /
Allow: /products
Allow: /blog
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*

# Common Crawl (用于训练 AI 模型)
User-agent: CCBot
Allow: /
Allow: /products
Allow: /blog
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*

# Perplexity AI
User-agent: PerplexityBot
Allow: /
Allow: /products
Allow: /blog
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*

# Cohere AI
User-agent: cohere-ai
Allow: /
Allow: /products
Allow: /blog
Disallow: /admin
Disallow: /admin/*
Disallow: /login
Disallow: /api
Disallow: /api/*

# ==========================================
# 重要文件声明
# ==========================================
Sitemap: ${baseUrl}/sitemap.xml
LLMs: ${baseUrl}/llms.txt
`

    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
        }
    })
}
