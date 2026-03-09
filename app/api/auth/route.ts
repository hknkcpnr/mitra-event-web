import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
const SESSION_LOGS_PATH = path.join(process.cwd(), 'data', 'session_logs.json');
const ACTIVE_SESSIONS_PATH = path.join(process.cwd(), 'data', 'active_sessions.json');
const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getActiveSessions(): Record<string, string> {
    try {
        if (!fs.existsSync(ACTIVE_SESSIONS_PATH)) {
            fs.writeFileSync(ACTIVE_SESSIONS_PATH, JSON.stringify({}), 'utf-8');
            return {};
        }
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

function logSession(username: string, status: 'success' | 'failed') {
    try {
        let logs = [];
        if (fs.existsSync(SESSION_LOGS_PATH)) {
            const raw = fs.readFileSync(SESSION_LOGS_PATH, 'utf-8');
            logs = JSON.parse(raw);
        }
        logs.unshift({
            id: crypto.randomUUID(),
            username,
            loginTime: new Date().toISOString(),
            status
        });
        if (logs.length > 500) logs = logs.slice(0, 500);
        fs.writeFileSync(SESSION_LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (e) {
        console.error("Failed to log session:", e);
    }
}

/**
 * GET /api/auth — Check if the current session is valid, returns role too
 */
export async function GET(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const sessions = getActiveSessions();

    if (token && sessions[token]) {
        const username = sessions[token];
        const users = getUsers();
        const user = users.find((u: any) => u.username === username);
        const role = user?.role || 'editor';
        return NextResponse.json({ authenticated: true, username, role });
    }

    return NextResponse.json({ authenticated: false });
}

// Simple in-memory rate limiting for login attempts
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BAN_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/auth — Login with username + password
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Check rate limit
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.count >= MAX_ATTEMPTS && (now - attempt.lastAttempt) < BAN_TIME) {
        const remaining = Math.ceil((BAN_TIME - (now - attempt.lastAttempt)) / 60000);
        return NextResponse.json(
            { error: `Çok fazla hatalı giriş denemesi. Lütfen ${remaining} dakika sonra tekrar deneyin.` },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Kullanıcı adı ve şifre gereklidir.' },
                { status: 400 }
            );
        }

        const users = getUsers();
        const user = users.find((u: any) => u.username === username);

        if (user && bcrypt.compareSync(password, user.password)) {
            // Success: Reset rate limit
            loginAttempts.delete(ip);

            const token = crypto.randomBytes(32).toString('hex');
            const sessions = getActiveSessions();
            sessions[token] = username;
            saveActiveSessions(sessions);
            logSession(username, 'success');

            const response = NextResponse.json({
                success: true,
                username: user.username,
                role: user.role || 'editor'
            });
            response.cookies.set(COOKIE_NAME, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: COOKIE_MAX_AGE,
                path: '/',
            });
            return response;
        }

        // Failure: Update rate limit
        const currentCount = (attempt?.count || 0) + 1;
        loginAttempts.set(ip, { count: currentCount, lastAttempt: now });

        logSession(username, 'failed');
        return NextResponse.json(
            { error: `Kullanıcı adı veya şifre hatalı. (Kalan deneme: ${MAX_ATTEMPTS - currentCount})` },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Giriş işlemi sırasında bir hata oluştu.' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/auth — Logout (clear session)
 */
export async function DELETE(request: NextRequest) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (token) {
        const sessions = getActiveSessions();
        if (sessions[token]) {
            delete sessions[token];
            saveActiveSessions(sessions);
        }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
    return response;
}
