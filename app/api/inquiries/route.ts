import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'inquiries.json');
const ACTIVE_SESSIONS_PATH = path.join(process.cwd(), 'data', 'active_sessions.json');
const COOKIE_NAME = 'admin_session';

function getActiveSessions(): Record<string, string> {
    try {
        if (!fs.existsSync(ACTIVE_SESSIONS_PATH)) return {};
        const raw = fs.readFileSync(ACTIVE_SESSIONS_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function authenticate(request: NextRequest | Request): string | null {
    // In Next.js, Request objects in API routes can have cookies
    // but we use NextRequest for better cookie handling.
    const token = (request as NextRequest).cookies?.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const sessions = getActiveSessions();
    return sessions[token] || null;
}

export async function GET(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading inquiries:', error);
        return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }
}

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

        let inquiries: any[] = [];
        if (fs.existsSync(DATA_PATH)) {
            const data = fs.readFileSync(DATA_PATH, 'utf8');
            inquiries = JSON.parse(data);
        }

        const newInquiry = {
            ...inquiry,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: 'beklemede',
            note: '',
        };

        inquiries.unshift(newInquiry);
        fs.writeFileSync(DATA_PATH, JSON.stringify(inquiries, null, 2));

        return NextResponse.json({ success: true, inquiry: newInquiry });
    } catch (error) {
        console.error('Error saving inquiry:', error);
        return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const { id, status, note } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ error: 'No inquiries found' }, { status: 404 });
        }

        const data = fs.readFileSync(DATA_PATH, 'utf8');
        const inquiries: any[] = JSON.parse(data);

        const idx = inquiries.findIndex((inq: any) => inq.id === id);
        if (idx === -1) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        if (status !== undefined) inquiries[idx].status = status;
        if (note !== undefined) inquiries[idx].note = note;

        fs.writeFileSync(DATA_PATH, JSON.stringify(inquiries, null, 2));

        return NextResponse.json({ success: true, inquiry: inquiries[idx] });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ error: 'No inquiries found' }, { status: 404 });
        }

        const data = fs.readFileSync(DATA_PATH, 'utf8');
        let inquiries = JSON.parse(data);
        inquiries = inquiries.filter((inq: any) => inq.id !== id);

        fs.writeFileSync(DATA_PATH, JSON.stringify(inquiries, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
    }
}
