import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'admin_session';

/**
 * İstekteki çerezi (cookie) kontrol ederek geçerli bir oturum olup olmadığını doğrular.
 * Oturum geçerliyse kullanıcı bilgileriyle birlikte oturum objesini döner.
 */
export async function getSessionWithUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return session;
}
