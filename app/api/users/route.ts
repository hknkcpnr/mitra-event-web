import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
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

function getUsers() {
    try {
        if (!fs.existsSync(USERS_PATH)) return [];
        const raw = fs.readFileSync(USERS_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveUsers(data: any) {
    fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** Returns the logged-in user object (with role), or null */
function authenticate(request: NextRequest): any | null {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const sessions = getActiveSessions();
    const username = sessions[token];
    if (!username) return null;
    const users = getUsers();
    return users.find((u: any) => u.username === username) || null;
}

/**
 * GET /api/users — List all users (any authenticated user)
 */
export async function GET(request: NextRequest) {
    const currentUser = authenticate(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const users = getUsers();
    const safeUsers = users.map((u: any) => ({
        id: u.id,
        username: u.username,
        role: u.role || 'editor',
        createdAt: u.createdAt,
    }));

    return NextResponse.json(safeUsers, { status: 200 });
}

/**
 * POST /api/users — Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
    const currentUser = authenticate(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { username, password, role } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur.' }, { status: 400 });
        }

        const allowedRoles = ['admin', 'editor'];
        const newRole = allowedRoles.includes(role) ? role : 'editor';

        const users = getUsers();
        if (users.some((u: any) => u.username === username)) {
            return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış.' }, { status: 400 });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = {
            id: crypto.randomUUID(),
            username,
            password: hashedPassword,
            role: newRole,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsers(users);

        return NextResponse.json({
            success: true,
            user: { id: newUser.id, username: newUser.username, role: newUser.role, createdAt: newUser.createdAt }
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Kullanıcı oluşturulurken hata oluştu.' }, { status: 500 });
    }
}

/**
 * DELETE /api/users — Delete a user (admin only)
 */
export async function DELETE(request: NextRequest) {
    const currentUser = authenticate(request);
    if (!currentUser) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
        return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Kullanıcı ID'si gereklidir." }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: any) => u.id === id);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        if (users[userIndex].username === currentUser.username) {
            return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz.' }, { status: 400 });
        }

        users.splice(userIndex, 1);
        saveUsers(users);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu.' }, { status: 500 });
    }
}
