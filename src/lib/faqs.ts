/**
 * FAQs Management
 *
 * Mock implementation for Drizzle/D1 migration
 */

export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

const mockFAQs: FAQ[] = [
    {
        id: 1,
        question: "Can I publish these FAQ entries as-is?",
        answer: "No. These entries are mock data only. Replace every question and answer with approved customer-facing content before launch.",
        category: "Template",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        question: "Where should I put delivery or service promises?",
        answer: "Use this section only after operations, legal, and support teams have approved the final wording for delivery, onboarding, or response commitments.",
        category: "Template",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        question: "Why does this page avoid detailed product claims?",
        answer: "The template intentionally avoids real specifications and certifications so teams can review layout and content hierarchy safely before production copy is ready.",
        category: "Template",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        question: "Can I keep these mock FAQs in staging?",
        answer: "Yes. Keeping clearly labeled placeholder FAQs in staging is the safest way to review UX and information architecture before publishing real business data.",
        category: "Template",
        order: 4,
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

import { D1Database, getFaqsD1 } from '@/lib/d1-db';

export async function getFAQs(db?: D1Database): Promise<{
    success: boolean;
    data?: FAQ[];
    error?: string;
}> {
    if (db) {
        try {
            const d1Faqs = await getFaqsD1(db, { isActive: true });
            const faqs: FAQ[] = d1Faqs.map(f => ({
                id: f.id,
                question: f.question as string,
                answer: f.answer as string,
                category: f.category as string,
                order: f.order as number,
                isActive: !!f.is_active,
                createdAt: f.created_at as string
            }));
            return { success: true, data: faqs };
        } catch (error) {
            console.error('Error fetching FAQs from D1:', error);
            return { success: false, error: 'Failed to fetch FAQs from DB' };
        }
    }

    // In a real DB, we would filter by page/category
    return {
        success: true,
        data: mockFAQs
    };
}
