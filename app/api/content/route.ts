import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getSessionWithUser } from '@/lib/auth';

const CONTENT_KEY = 'site_content';

/**
 * İçerik objesi içindeki tüm resim yollarını (/uploads/) bulur.
 */
function getAllUploadPaths(obj: unknown): string[] {
  const paths: string[] = [];
  const search = (item: unknown) => {
    if (!item) return;

    if (typeof item === 'string' && item.startsWith('/uploads/')) {
      paths.push(item);
      return;
    }

    if (Array.isArray(item)) {
      item.forEach(search);
      return;
    }

    if (typeof item === 'object') {
      Object.values(item as Record<string, unknown>).forEach(search);
    }
  };

  search(obj);
  return Array.from(new Set(paths));
}

/**
 * Veritabanından mevcut site içeriğini okur.
 */
async function readContentFromDb() {
  const row = await prisma.content.findUnique({ where: { key: CONTENT_KEY } });
  if (!row) return null;

  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

/**
 * Site içeriğini getiren GET metodu.
 */
export async function GET() {
  try {
    const data = await readContentFromDb();
    if (!data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json({ error: 'Failed to read content data' }, { status: 500 });
  }
}

/**
 * Site içeriğini güncelleyen POST metodu.
 * Eskiye nazaran silinen resimleri sunucudan temizler.
 */
export async function POST(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const newData = await request.json();
    const oldData = (await readContentFromDb()) || {};

    const oldPaths = getAllUploadPaths(oldData);
    const newPaths = getAllUploadPaths(newData);
    const abandonedPaths = oldPaths.filter((p) => !newPaths.includes(p));

    for (const relPath of abandonedPaths) {
      try {
        const absPath = path.join(process.cwd(), 'public', relPath);
        if (fs.existsSync(absPath) && absPath.includes(path.join('public', 'uploads'))) {
          fs.unlinkSync(absPath);
        }
      } catch (err) {
        console.error(`Failed to delete abandoned image ${relPath}:`, err);
      }
    }

    await prisma.content.upsert({
      where: { key: CONTENT_KEY },
      update: { value: JSON.stringify(newData) },
      create: { key: CONTENT_KEY, value: JSON.stringify(newData) },
    });

    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error writing content:', error);
    return NextResponse.json({ error: 'Failed to update content data' }, { status: 500 });
  }
}
