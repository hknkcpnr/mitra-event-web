import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionWithUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Dosya Yükleme API'si
 * Güvenlik kontrollerini yapar, Cloudinary veya Yerel sunucuya yükler
 * ve kayıt bilgilerini veritabanına ekler.
 */
export async function POST(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erisim. Dosya yukleme izniniz yok.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Dosya bulunamadi' }, { status: 400 });
    }

    // Fetch dynamic limits from DB
    const contentRow = await prisma.content.findUnique({ where: { key: 'site_content' } });
    let systemSettings: any = {};
    if (contentRow) {
      try {
        const siteData = JSON.parse(contentRow.value);
        systemSettings = siteData.systemSettings || {};
      } catch (e) {
        console.error('Error parsing site content for upload limits:', e);
      }
    }

    const maxMB = parseInt(systemSettings.maxImageSize || '10');
    const allowedFormatsStr = systemSettings.allowedImageFormats || '.jpg,.jpeg,.png,.gif,.webp';
    const allowedExtensions = allowedFormatsStr.split(',').map((s: string) => s.trim().toLowerCase());

    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ error: `Sadece ${allowedFormatsStr} formatlari yuklenebilir.` }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Gecersiz dosya turu.' }, { status: 400 });
    }

    const maxSize = maxMB * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Dosya boyutu ${maxMB} MB'dan buyuk olamaz.` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let secureUrl = '';
    let publicId = '';

    // Eğer Cloudinary ayarları .env dosyasında belirtilmişse buluta yükle:
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'mitraevent' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(buffer);
        }) as any;

        secureUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } catch (cloudinaryErr: any) {
        console.error('Cloudinary upload error:', cloudinaryErr);
        throw new Error(`Cloudinary hatası: ${cloudinaryErr.message || 'Yükleme başarısız'}`);
      }
    } else {
      // Cloudinary ayarları yoksa eski sistem (XAMPP/Local) lokal "public/uploads" yükle
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, buffer);

      secureUrl = `/uploads/${uniqueName}`;
    }

    // Resmi güvenli bir şekilde artık MySQL Veritabanına kaydet (Galeride çıkması için)
    const newImage = await prisma.galleryImage.create({
      data: {
        url: secureUrl,
        publicId: publicId || null,
        size: file.size,
        title: file.name,
        alt: file.name
      }
    });

    return NextResponse.json({ path: secureUrl, image: newImage });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: `Dosya yuklenemedi: ${error.message || 'Bilinmeyen bir hata olustu.'}` }, { status: 500 });
  }
}
