import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionWithUser } from '@/lib/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Galeri resimlerini listeleyen GET metodu.
 * Hem veritabanındaki (Cloudinary) hem de yerel sunucudaki resimleri harmanlar.
 */
export async function GET() {
    try {
        // DB'den resimleri çek
        const dbImages = await prisma.galleryImage.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Eskiden kalma lokal upload klasörünü de oku (geriye dönük uyumluluk)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        let localFiles: string[] = [];
        try {
            await fs.access(uploadsDir);
            const files = await fs.readdir(uploadsDir);
            localFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        } catch {
            // Uploads klasörü yoksa görmezden gel
        }

        const images = dbImages.map(img => ({
            id: img.id,
            name: img.title || 'Resim',
            url: img.url,
            size: img.size || 0,
            publicId: img.publicId,
            time: img.createdAt.getTime()
        }));

        // DB'de olmayan lokal dosyaları da ekleyelim
        for (const fileName of localFiles) {
            const url = `/uploads/${fileName}`;
            if (!images.some(img => img.url === url)) {
                try {
                    const stats = await fs.stat(path.join(uploadsDir, fileName));
                    images.push({
                        id: fileName, // lokal dosyalar için id yerine fileName
                        name: fileName,
                        url: url,
                        size: stats.size,
                        publicId: null,
                        time: stats.mtimeMs
                    });
                } catch { }
            }
        }

        // Zamanlarına göre yeni eklenenler en üstte kalacak şekilde sırala
        images.sort((a, b) => b.time - a.time);

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Error reading gallery:', error);
        return NextResponse.json({ error: 'Resimler yüklenemedi' }, { status: 500 });
    }
}

import { NextRequest } from 'next/server';

/**
 * Galeri resmini tamamen silen DELETE metodu.
 * Resmi Cloudinary, yerel disk ve veritabanından temizler.
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSessionWithUser(request);
        if (!session) {
            return NextResponse.json({ error: 'Yetkisiz erişim. Fotoğraf silmek için yönetici olmalısınız.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id'); // ID varsa öncelikli (veritabanı silme)
        const filename = searchParams.get('file');

        if (!id && !filename) {
            return NextResponse.json({ error: 'Dosya veya ID belirtilmedi' }, { status: 400 });
        }

        // Veritabanı ID si gelmişse ve Prisma'da varsa:
        if (id) {
            const image = await prisma.galleryImage.findUnique({ where: { id } }).catch(() => null);
            if (image) {
                // Cloudinary'deyse oradan sil
                if (image.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
                    await cloudinary.uploader.destroy(image.publicId);
                }
                // Veritabanından sil
                await prisma.galleryImage.delete({ where: { id } });

                // Yine de lokal bir url ise bilgisayardan da sil:
                if (image.url.startsWith('/uploads/')) {
                    const filePath = path.join(process.cwd(), 'public', image.url);
                    try { await fs.unlink(filePath); } catch { }
                }

                return NextResponse.json({ success: true, message: 'Resim silindi' });
            }
        }

        // Fallback: Eski "public/uploads" lokal resim silme
        if (filename) {
            const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
            const filePath = path.resolve(uploadsDir, filename);

            if (!filePath.startsWith(uploadsDir)) {
                return NextResponse.json({ error: 'Geçersiz dosya yolu' }, { status: 400 });
            }

            try {
                await fs.access(filePath);
                await fs.unlink(filePath);
                return NextResponse.json({ success: true, message: 'Lokal resim silindi' });
            } catch {
                return NextResponse.json({ error: 'Lokal dosya bulunamadı' }, { status: 404 });
            }
        }

        return NextResponse.json({ error: 'Resim bulunamadı' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({ error: 'Resim silinemedi' }, { status: 500 });
    }
}
