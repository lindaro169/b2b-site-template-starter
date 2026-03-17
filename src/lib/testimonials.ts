/**
 * Testimonials Management
 *
 * Mock implementation for Drizzle/D1 migration
 */

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
        authorName: "Sarah Johnson",
        authorCompany: "Crystal Harmony Boutique",
        content: "The quality of the rose quartz bracelets is outstanding. My customers love the energy and the craftsmanship. Shipping was fast and the packaging was professional.",
        rating: 5,
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        authorName: "Michael Chen",
        authorCompany: "Zen Living",
        content: "We used the sanitized demo catalog to review layout and section density before adding our live assortment. It was much safer for internal review.",
        rating: 5,
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        authorName: "Emma Davis",
        authorCompany: "Yoga Spirit Studio",
        content: "The chakra jewelry sets are a huge hit in our yoga studio. They are beautiful and authentic. Highly recommend for any wellness retailer.",
        rating: 5,
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

import { D1Database, getTestimonialsD1 } from '@/lib/d1-db';

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
