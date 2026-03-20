/**
 * Testimonials Management
 *
 * Mock implementation for Drizzle/D1 migration
 */

import { D1Database, getTestimonialsD1 } from '@/lib/d1-db';

export interface Testimonial {
    id: number;
    authorName: string;
    authorCompany?: string;
    authorImage?: string;
    content: string;
    rating: number;
    order: number;
    isActive: boolean;
    createdAt: string;
}

const mockTestimonials: Testimonial[] = [
    {
        id: 1,
        authorName: "模板客户 A",
        authorCompany: "Template Retail Demo",
        content: "这是模板评价示例，用于演示前台模块与后台数据结构。上线前请替换为已获授权的真实客户反馈。",
        rating: 5,
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        authorName: "模板客户 B",
        authorCompany: "Template Buyer Lab",
        content: "该占位评价仅用于模板预览，帮助确认排版、字数密度和评分组件显示效果，不对应任何真实品牌。",
        rating: 5,
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        authorName: "模板客户 C",
        authorCompany: "Template Studio Preview",
        content: "这里保留的是可替换的 mock data，用于演示客户评价区域。发布前请统一替换为你的业务文案和真实案例。",
        rating: 5,
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

export async function getTestimonials(db?: D1Database): Promise<{
    success: boolean;
    data?: Testimonial[];
    error?: string;
}> {
    if (db) {
        try {
            const d1Testimonials = await getTestimonialsD1(db, { isActive: true });
            const testimonials: Testimonial[] = d1Testimonials.map(t => ({
                id: t.id,
                authorName: t.author_name as string,
                authorCompany: t.author_company as string,
                authorImage: t.author_image as string,
                content: t.content as string,
                rating: t.rating as number,
                order: t.order as number,
                isActive: !!t.is_active,
                createdAt: t.created_at as string
            }));
            return { success: true, data: testimonials };
        } catch (error) {
            console.error('Error fetching testimonials from D1:', error);
            // Fallback to mock if D1 fails? Or return error?
            // For now, let's return error to be explicit, or fallback if desired.
            // Given the task is to leverage D1, we should probably return the error or empty list.
            // But to keep homepage working if D1 fails, maybe fallback is better?
            // Let's stick to returning error if D1 is provided but fails.
            return { success: false, error: 'Failed to fetch testimonials from DB' };
        }
    }

    return {
        success: true,
        data: mockTestimonials
    };
}
