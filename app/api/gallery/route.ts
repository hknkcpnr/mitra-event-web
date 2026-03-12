import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionWithUser } from '@/lib/auth';

// Cloudinary Yapılandırması
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Galeri resimlerini listeleyen GET metodu.
 * Hem veritabanındaki (Cloudinary/MySQL) hem de yerel sunucudaki resimleri harmanlar.
 */
export async function GET() {
    try {
        console.log('GET /api/gallery - DB request started');
        
        // Veritabanından resimleri çek (Hızlı cevap için 100 ile sınırlı)
        const dbImages = await prisma.galleryImage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        
        console.log(`GET /api/gallery - Found ${dbImages.length} images in DB`);

        // Geriye dönük uyumluluk: Yerel uploads klasörünü kontrol et
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        let localFiles: string[] = [];
        
        // Vercel/Prod ortamında bu klasör genellikle salt-okunur veya boştur
        try {
            const dirExists = await fs.access(uploadsDir).then(() => true).catch(() => false);
            if (dirExists) {
                const files = await fs.readdir(uploadsDir);
                localFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
            }
        } catch (dirErr) {
            console.warn('Local uploads directory not accessible (expected in prod):', dirErr);
        }

        // DB'den gelenleri formatla
        const images = dbImages.map(img => ({
            id: img.id,
            name: img.title || 'Resim',
            url: img.url,
            size: img.size || 0,
            publicId: img.publicId,
            time: img.createdAt ? new Date(img.createdAt).getTime() : Date.now()
        }));

        // DB'de olmayıp lokalde olanları ekle
        for (const fileName of localFiles.slice(0, 50)) {
            const url = `/uploads/${fileName}`;
            if (!images.some(img => img.url === url)) {
                try {
                    const stats = await fs.stat(path.join(uploadsDir, fileName));
                    images.push({
                        id: fileName,
                        name: fileName,
                        url: url,
                        size: stats.size,
                        publicId: null,
                        time: stats.mtimeMs
                    });
                } catch { }
            }
        }

        // En yeniden en eskiye sırala
        images.sort((a, b) => b.time - a.time);

        return NextResponse.json({ images });
    } catch (error: any) {
        console.error('CRITICAL: Gallery GET Error:', error);
        return NextResponse.json({ 
            error: 'Veritabanı bağlantısı kurulamadı veya resimler okunurken bir hata oluştu.',
            details: error.message 
        }, { status: 500 });
    }
}

/**
 * Galeri resmini tamamen silen DELETE metodu.
 * Resmi Cloudinary, yerel disk ve veritabanından temizler.
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSessionWithUser(request);
        if (!session) {
            return NextResponse.json({ error: 'Yetkisiz erişim. Fotoğraf silmek için oturum açmalısınız.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const filename = searchParams.get('file');

        if (!id && !filename) {
            return NextResponse.json({ error: 'Silinecek resmi belirtmek için ID veya dosya adı gereklidir.' }, { status: 400 });
        }

        // 1. Veritabanında Kayıtlı Resim Silme
        if (id) {
            const image = await prisma.galleryImage.findUnique({ where: { id } }).catch(() => null);
            if (image) {
                // Cloudinary'den temizle
                if (image.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
                    try {
                        await cloudinary.uploader.destroy(image.publicId);
                    } catch (clErr) {
                        console.error('Cloudinary deletion failed:', clErr);
                    }
                }
                
                // DB'den sil
                await prisma.galleryImage.delete({ where: { id } });

                // Lokal dosyayı da silmeyi dene
                if (image.url.startsWith('/uploads/')) {
                    const filePath = path.join(process.cwd(), 'public', image.url);
                    try { await fs.unlink(filePath); } catch { }
                }

                return NextResponse.json({ success: true, message: 'Resim başarıyla sistemden kaldırıldı.' });
            }
        }

        // 2. Sadece Lokal Dosya Silme (Fallback)
        if (filename) {
            const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
            const filePath = path.resolve(uploadsDir, filename);

            if (filePath.startsWith(uploadsDir)) {
                try {
                    await fs.access(filePath);
                    await fs.unlink(filePath);
                    return NextResponse.json({ success: true, message: 'Yerel dosya silindi.' });
                } catch {
                    return NextResponse.json({ error: 'Dosya sistemde bulunamadı.' }, { status: 404 });
                }
            }
        }

        return NextResponse.json({ error: 'Silinecek resim bulunamadı.' }, { status: 404 });
    } catch (error: any) {
        console.error('DELETE /api/gallery Error:', error);
        return NextResponse.json({ error: 'Silme işlemi sırasında sunucu hatası oluştu.' }, { status: 500 });
    }
}
