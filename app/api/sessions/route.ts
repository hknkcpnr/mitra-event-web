import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SESSION_LOGS_PATH = path.join(process.cwd(), 'data', 'session_logs.json');
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

function getSessionLogs() {
    try {
        if (!fs.existsSync(SESSION_LOGS_PATH)) return [];
        const raw = fs.readFileSync(SESSION_LOGS_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

/**
 * Middleware-like check to ensure user is logged in
 */
function authenticate(request: NextRequest): string | null {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const sessions = getActiveSessions();
    return sessions[token] || null;
}

/**
 * GET /api/sessions — List all session logs
 */
export async function GET(request: NextRequest) {
    const currentUsername = authenticate(request);
    if (!currentUsername) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const logs = getSessionLogs();

    return NextResponse.json(logs, { status: 200 });
}
