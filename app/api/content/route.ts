import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'data', 'content.json');
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
    // Content can be viewed by anyone (public site needs it), 
    // but we can restrict if needed. Keeping it public for now.
    try {
        const fileContents = fs.readFileSync(CONTENT_PATH, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading content file:', error);
        return NextResponse.json({ error: 'Failed to read content data' }, { status: 500 });
    }
}

/**
 * Utility to extract all /uploads/ paths from a JSON object
 */
function getAllUploadPaths(obj: any): string[] {
    const paths: string[] = [];
    const search = (item: any) => {
        if (!item) return;
        if (typeof item === 'string' && item.startsWith('/uploads/')) {
            paths.push(item);
        } else if (Array.isArray(item)) {
            item.forEach(search);
        } else if (typeof item === 'object') {
            Object.values(item).forEach(search);
        }
    };
    search(obj);
    return Array.from(new Set(paths));
}

export async function POST(request: NextRequest) {
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    try {
        const newData = await request.json();

        // 1. Read old data to find abandoned images
        let oldData = {};
        try {
            if (fs.existsSync(CONTENT_PATH)) {
                oldData = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
            }
        } catch (e) {
            console.error("Error reading old content for cleanup:", e);
        }

        const oldPaths = getAllUploadPaths(oldData);
        const newPaths = getAllUploadPaths(newData);

        // 2. Identify and delete abandoned images
        const abandonedPaths = oldPaths.filter(p => !newPaths.includes(p));

        for (const relPath of abandonedPaths) {
            try {
                // Ensure we only delete from the public/uploads directory
                const absPath = path.join(process.cwd(), 'public', relPath);
                if (fs.existsSync(absPath) && absPath.includes(path.join('public', 'uploads'))) {
                    fs.unlinkSync(absPath);
                    console.log(`Successfully deleted abandoned image: ${relPath}`);
                }
            } catch (err) {
                console.error(`Failed to delete abandoned image ${relPath}:`, err);
            }
        }

        // 3. Save new data
        fs.writeFileSync(CONTENT_PATH, JSON.stringify(newData, null, 2), 'utf8');
        return NextResponse.json({ message: 'Content updated successfully' });
    } catch (error) {
        console.error('Error writing content file:', error);
        return NextResponse.json({ error: 'Failed to update content data' }, { status: 500 });
    }
}
