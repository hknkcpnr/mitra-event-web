import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'admin_session';

/**
 * Giriş yapmış olan yöneticinin kendi bilgilerini (E-posta, Şifre) güncellemesini sağlayan PUT metodu.
 * Güvenlik için mevcut şifrenin doğrulanması zorunludur.
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Gecersiz veya suresi dolmus oturum.' }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || '');
    const requestedUsername = String(body.newUsername || body.newEmail || '').trim().toLowerCase();
    const newPassword = String(body.newPassword || '');

    if (!currentPassword) {
      return NextResponse.json({ error: 'Mevcut sifrenizi girmelisiniz.' }, { status: 400 });
    }

    if (!requestedUsername && !newPassword) {
      return NextResponse.json({ error: 'Guncellenecek yeni bir bilgi girilmedi.' }, { status: 400 });
    }

    if (!bcrypt.compareSync(currentPassword, session.user.password)) {
      return NextResponse.json({ error: 'Mevcut sifre hatali.' }, { status: 401 });
    }

    const updateData: { email?: string; password?: string; name?: string } = {};

    if (requestedUsername) {
      const existingUser = await prisma.user.findUnique({
        where: { email: requestedUsername },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Bu kullanici adi/e-posta zaten kullanimda.' }, { status: 400 });
      }

      updateData.email = requestedUsername;
      updateData.name = requestedUsername;
    }

    if (newPassword) {
      updateData.password = bcrypt.hashSync(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Hesap bilgileri basariyla guncellendi.' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Guncelleme sirasinda bir hata olustu.' }, { status: 500 });
  }
}
