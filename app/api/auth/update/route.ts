import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'app', 'data', 'users.json');
const ACTIVE_SESSIONS_PATH = path.join(process.cwd(), 'app', 'data', 'active_sessions.json');
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

function saveActiveSessions(sessions: Record<string, string>) {
    try {
        fs.writeFileSync(ACTIVE_SESSIONS_PATH, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (e) {
        console.error("Failed to save active sessions:", e);
    }
}

function getUsers() {
    try {
        const raw = fs.readFileSync(USERS_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveUsers(data: any) {
    fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * PUT /api/auth/update — Update username and/or password for logged in user
 */
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
        }

        const sessions = getActiveSessions();
        const currentUsername = sessions[token];

        if (!currentUsername) {
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş oturum.' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newUsername, newPassword } = body;

        if (!currentPassword) {
            return NextResponse.json({ error: 'Mevcut şifrenizi girmelisiniz.' }, { status: 400 });
        }

        if (!newUsername && !newPassword) {
            return NextResponse.json({ error: 'Güncellenecek yeni bir bilgi girilmedi.' }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex((u: any) => u.username === currentUsername);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        // Verify current password
        if (currentPassword !== users[userIndex].password) {
            return NextResponse.json({ error: 'Mevcut şifre hatalı.' }, { status: 401 });
        }

        // Update credentials
        const updatedUsername = newUsername || users[userIndex].username;
        users[userIndex] = {
            ...users[userIndex],
            username: updatedUsername,
            password: newPassword || users[userIndex].password,
        };

        saveUsers(users);

        // If username changed, update the active session map so they don't get logged out randomly
        if (newUsername && newUsername !== currentUsername) {
            sessions[token] = updatedUsername;
            saveActiveSessions(sessions);
        }

        return NextResponse.json({ success: true, message: 'Hesap bilgileri başarıyla güncellendi.' });

    } catch (error) {
        return NextResponse.json(
            { error: 'Güncelleme sırasında bir hata oluştu.' },
            { status: 500 }
        );
    }
}
