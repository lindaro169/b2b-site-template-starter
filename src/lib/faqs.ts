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
        question: "What is the Minimum Order Quantity (MOQ)?",
        answer: "Our MOQ is 5 pieces per style for existing designs. For custom designs, the MOQ starts at 50 pieces depending on the complexity.",
        category: "Orders",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        question: "Do you offer international shipping?",
        answer: "Yes, we ship to over 30 countries worldwide. Shipping costs and times vary by location. We use reliable carriers like DHL, FedEx, and UPS.",
        category: "Shipping",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        question: "Are your crystals natural?",
        answer: "Yes, all our crystals are guaranteed natural unless specified otherwise (e.g., opalite). We provide certificates of authenticity for our premium collection.",
        category: "Products",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        question: "Can I customize the jewelry?",
        answer: "Absolutely! We offer customization for bead sizes, charms, and packaging. Contact our sales team for a custom quote.",
        category: "Customization",
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
