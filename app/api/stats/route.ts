import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const statsFilePath = path.join(process.cwd(), 'data', 'stats.json');
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

    try {
        if (!fs.existsSync(statsFilePath)) {
            return NextResponse.json({ daily: [], summary: {} });
        }
        const fileContents = fs.readFileSync(statsFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading stats file:', error);
        return NextResponse.json({ error: 'Failed to read stats data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { type, path: pagePath } = await request.json();
        const today = new Date().toISOString().split('T')[0];

        let stats: any = { daily: [], summary: { totalVisitors: 0, totalPageViews: 0, topPages: [] } };
        if (fs.existsSync(statsFilePath)) {
            try {
                const raw = fs.readFileSync(statsFilePath, 'utf8');
                stats = JSON.parse(raw);
            } catch (e) {
                console.error("Stats parse error, using default");
            }
        }

        // Initialize structures if missing
        if (!stats.daily) stats.daily = [];
        if (!stats.summary) stats.summary = { totalVisitors: 0, totalPageViews: 0, topPages: [] };

        // Find or create today's record
        let todayRecord = stats.daily.find((d: any) => d.date === today);
        if (!todayRecord) {
            todayRecord = {
                date: today,
                visitors: 0,
                pageViews: 0,
                avgDuration: 0,
                bounceRate: 0
            };
            stats.daily.push(todayRecord);
        }

        if (type === 'visit') {
            todayRecord.visitors = (todayRecord.visitors || 0) + 1;
            stats.summary.totalVisitors = (stats.summary.totalVisitors || 0) + 1;
        }

        todayRecord.pageViews = (todayRecord.pageViews || 0) + 1;
        stats.summary.totalPageViews = (stats.summary.totalPageViews || 0) + 1;

        // Update top pages
        if (pagePath) {
            if (!stats.summary.topPages) stats.summary.topPages = [];
            let pageRecord = stats.summary.topPages.find((p: any) => p.path === pagePath);
            if (pageRecord) {
                pageRecord.views += 1;
            } else {
                stats.summary.topPages.push({ path: pagePath, views: 1 });
            }
            // Sort top pages by views and keep top 10
            stats.summary.topPages.sort((a: any, b: any) => b.views - a.views);
            stats.summary.topPages = stats.summary.topPages.slice(0, 10);
        }

        fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 4));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating stats:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}
