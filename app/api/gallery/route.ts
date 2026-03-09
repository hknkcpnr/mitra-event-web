import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        // Klasör yoksa boş liste dön
        try {
            await fs.access(uploadsDir);
        } catch {
            return NextResponse.json({ images: [] });
        }

        const files = await fs.readdir(uploadsDir);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

        const images = await Promise.all(imageFiles.map(async (fileName) => {
            const filePath = path.join(uploadsDir, fileName);
            const stats = await fs.stat(filePath);
            return {
                name: fileName,
                size: stats.size,
                time: stats.mtimeMs
            };
        }));

        // Yenileri en üste getir (mtime ms'e göre sıralama)
        images.sort((a, b) => b.time - a.time);

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Error reading gallery:', error);
        return NextResponse.json({ error: 'Resimler yüklenemedi' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('file');

        if (!filename) {
            return NextResponse.json({ error: 'Dosya adı belirtilmedi' }, { status: 400 });
        }

        const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
        const filePath = path.resolve(uploadsDir, filename);

        // Güvenlik kontrolü: Dosyanın uploads klasöründe olduğundan emin ol
        if (!filePath.startsWith(uploadsDir)) {
            return NextResponse.json({ error: 'Geçersiz dosya yolu' }, { status: 400 });
        }

        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            return NextResponse.json({ success: true, message: 'Resim silindi' });
        } catch {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({ error: 'Resim silinemedi' }, { status: 500 });
    }
}
