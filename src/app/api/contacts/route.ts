import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Contact submitted successfully',
                data: { id: Date.now(), ...body }
            },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to submit contact' },
            { status: 500 }
        );
    }
}
