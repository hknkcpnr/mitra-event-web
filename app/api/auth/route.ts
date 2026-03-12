import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const BAN_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * Mevcut oturumun geçerliliğini kontrol eden GET metodu.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      email: session.user.email,
      username: session.user.email,
      role: session.user.role,
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ authenticated: false });
  }
}

/**
 * Kullanıcı girişi (Login) işlemini gerçekleştiren POST metodu.
 * Brute-force saldırılarına karşı deneme limiti ve ban süresi içerir.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && attempt.count >= MAX_ATTEMPTS && now - attempt.lastAttempt < BAN_TIME) {
    const remaining = Math.ceil((BAN_TIME - (now - attempt.lastAttempt)) / 60000);
    return NextResponse.json(
      { error: `Cok fazla hatali giris denemesi. Lutfen ${remaining} dakika sonra tekrar deneyin.` },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const emailOrUsername = String(body.email || body.username || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: 'Kullanici adi/e-posta ve sifre gereklidir.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: emailOrUsername },
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      loginAttempts.delete(ip);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

      await prisma.session.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      await prisma.sessionLog.create({
        data: {
          userId: user.id,
          username: user.email,
          status: 'success',
        },
      });

      const response = NextResponse.json({
        success: true,
        email: user.email,
        username: user.email,
        role: user.role,
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    }

    const currentCount = (attempt?.count || 0) + 1;
    loginAttempts.set(ip, { count: currentCount, lastAttempt: now });
    await prisma.sessionLog.create({
      data: {
        username: emailOrUsername,
        status: 'failed',
      },
    });

    return NextResponse.json(
      { error: `Kullanici adi/e-posta veya sifre hatali. (Kalan deneme: ${MAX_ATTEMPTS - currentCount})` },
      { status: 401 },
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Giris islemi sirasinda bir hata olustu.' }, { status: 500 });
  }
}

/**
 * Kullanıcı çıkış (Logout) işlemini gerçekleştiren DELETE metodu.
 * Oturumu veritabanından siler ve tarayıcı çerezlerini temizler.
 */
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await prisma.session.delete({
        where: { token },
      });
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
