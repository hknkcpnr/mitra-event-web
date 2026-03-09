import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function POST(request: NextRequest) {
    // 1. Yetki Kontrolü
    if (!authenticate(request)) {
        return NextResponse.json({ error: 'Yetkisiz erişim. Dosya yükleme izniniz yok.' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        // 2. Sadece resim dosyalarına izin veren güvenlik kontrolü
        const ext = path.extname(file.name).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (!allowedExtensions.includes(ext)) {
            return NextResponse.json({ error: 'Sadece resim dosyaları (.jpg, .jpeg, .png, .gif, .webp) yüklenebilir.' }, { status: 400 });
        }

        // 3. Dosya MIME türü kontrolü (Ekstra güvenlik)
        const mimeType = file.type;
        if (!mimeType.startsWith('image/')) {
            return NextResponse.json({ error: 'Geçersiz dosya türü.' }, { status: 400 });
        }

        // 4. Boyut kontrolü (Maksimum 10 MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Dosya boyutu 10 MB'dan büyük olamaz." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload dizininin varlığını kontrol et ve oluştur
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Güvenli dosya adı oluşturma
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueName = `${baseName}_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, uniqueName);

        fs.writeFileSync(filePath, buffer);

        const publicPath = `/uploads/${uniqueName}`;
        return NextResponse.json({ path: publicPath });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 });
    }
}
