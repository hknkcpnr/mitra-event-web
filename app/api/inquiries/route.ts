import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getSessionWithUser } from '@/lib/auth';

/**
 * Başvuru listesini getiren GET metodu (Yalnızca Admin/Editör).
 */
export async function GET(request: NextRequest) {
    const session = await getSessionWithUser(request);
    if (!session) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const inquiries = await prisma.inquiry.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(inquiries);
    } catch (error) {
        console.error('Error reading inquiries:', error);
        return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }
}

/**
 * Ziyaretçilerin yeni bir başvuru/talep göndermesini sağlayan POST metodu.
 */
export async function POST(request: Request) {
    try {
        const inquiry = await request.json();

        // Basic validation
        if (!inquiry.name || typeof inquiry.name !== 'string' || inquiry.name.trim().length === 0) {
            return NextResponse.json({ error: 'Geçerli bir ad girin.' }, { status: 400 });
        }
        if (!inquiry.email || typeof inquiry.email !== 'string' || !inquiry.email.includes('@')) {
            return NextResponse.json({ error: 'Geçerli bir email girin.' }, { status: 400 });
        }
        if (!inquiry.message || typeof inquiry.message !== 'string' || inquiry.message.trim().length === 0) {
            return NextResponse.json({ error: 'Mesaj boş olamaz.' }, { status: 400 });
        }

        const newInquiry = await prisma.inquiry.create({
            data: {
                name: inquiry.name.trim(),
                email: inquiry.email.trim().toLowerCase(),
                phone: inquiry.phone || null,
                eventType: inquiry.eventType || null,
                message: inquiry.message.trim(),
                status: 'beklemede',
                note: '',
            },
        });

        return NextResponse.json({ success: true, inquiry: newInquiry });
    } catch (error) {
        console.error('Error saving inquiry:', error);
        return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
    }
}

/**
 * Başvuru durumunu (okundu/not) güncelleyen PATCH metodu.
 */
export async function PATCH(request: NextRequest) {
    const session = await getSessionWithUser(request);
    if (!session) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const { id, status, note } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: {
                ...(status !== undefined && { status }),
                ...(note !== undefined && { note }),
            },
        });

        return NextResponse.json({ success: true, inquiry });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
    }
}

/**
 * Bir başvuruyu kalıcı olarak silen DELETE metodu.
 */
export async function DELETE(request: NextRequest) {
    const session = await getSessionWithUser(request);
    if (!session) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.inquiry.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
    }
}
