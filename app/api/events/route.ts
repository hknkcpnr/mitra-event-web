import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EVENTS_PATH = path.join(process.cwd(), 'data', 'events.json');
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

function getEvents(): any[] {
    try {
        if (!fs.existsSync(EVENTS_PATH)) {
            fs.writeFileSync(EVENTS_PATH, '[]', 'utf-8');
            return [];
        }
        const raw = fs.readFileSync(EVENTS_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveEvents(data: any[]) {
    fs.writeFileSync(EVENTS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** Returns username if authenticated, else null */
function authenticate(request: NextRequest): string | null {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const sessions = getActiveSessions();
    return sessions[token] || null;
}

export async function GET(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    const events = getEvents();
    return NextResponse.json(events, { status: 200 });
}

export async function POST(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, date, description, firstName, lastName, phone, paymentStatus, reminderDays, price, eventType } = body;

        if (!title || !date || !firstName || !lastName || !phone) {
            return NextResponse.json({ error: 'Gerekli alanları doldurunuz.' }, { status: 400 });
        }

        const events = getEvents();
        const newEvent = {
            id: crypto.randomUUID(),
            title,
            date,
            description: description || '',
            eventType: eventType || 'diğer',
            firstName,
            lastName,
            phone,
            price: price || '',
            paymentStatus: paymentStatus || 'beklemede',
            reminderDays: reminderDays ? parseInt(reminderDays, 10) : 0,
            createdAt: new Date().toISOString()
        };

        events.push(newEvent);
        saveEvents(events);

        return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Organizasyon eklenirken hata oluştu.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, title, date, description, firstName, lastName, phone, paymentStatus, reminderDays, price, eventType } = body;

        if (!id) {
            return NextResponse.json({ error: 'Organizasyon ID\'si gerekli.' }, { status: 400 });
        }

        const events = getEvents();
        const index = events.findIndex(e => e.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Organizasyon bulunamadı.' }, { status: 404 });
        }

        const updatedEvent = {
            ...events[index],
            title: title !== undefined ? title : events[index].title,
            date: date !== undefined ? date : events[index].date,
            description: description !== undefined ? description : events[index].description,
            eventType: eventType !== undefined ? eventType : events[index].eventType,
            firstName: firstName !== undefined ? firstName : events[index].firstName,
            lastName: lastName !== undefined ? lastName : events[index].lastName,
            phone: phone !== undefined ? phone : events[index].phone,
            price: price !== undefined ? price : events[index].price,
            paymentStatus: paymentStatus !== undefined ? paymentStatus : events[index].paymentStatus,
            reminderDays: reminderDays !== undefined ? parseInt(reminderDays, 10) : events[index].reminderDays,
            updatedAt: new Date().toISOString()
        };

        events[index] = updatedEvent;
        saveEvents(events);

        return NextResponse.json({ success: true, event: updatedEvent }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: 'Organizasyon güncellenirken hata oluştu.' }, { status: 500 });
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
            return NextResponse.json({ error: 'Organizasyon ID\'si gerekli.' }, { status: 400 });
        }

        const events = getEvents();
        const index = events.findIndex(e => e.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Organizasyon bulunamadı.' }, { status: 404 });
        }

        events.splice(index, 1);
        saveEvents(events);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: 'Organizasyon silinirken hata oluştu.' }, { status: 500 });
    }
}
