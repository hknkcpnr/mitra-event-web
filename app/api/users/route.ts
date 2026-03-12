import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionWithUser } from '@/lib/auth';

function toSafeUser(user: { id: string; email: string; role: string; createdAt: Date }) {
  return {
    id: user.id,
    username: user.email,
    role: user.role || 'editor',
    createdAt: user.createdAt,
  };
}

/**
 * Sistemdeki tüm kayıtlı kullanıcıları getiren GET metodu.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(users.map(toSafeUser), { status: 200 });
}

/**
 * Yeni bir yönetici veya editör oluşturan POST metodu.
 * Şifreleri BCrypt ile hashleyerek güvenli bir şekilde kaydeder.
 */
export async function POST(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, role } = body as {
      username?: string;
      password?: string;
      role?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur.' }, { status: 400 });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const allowedRoles = ['admin', 'editor'];
    const newRole = allowedRoles.includes(role || '') ? role! : 'editor';

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedUsername },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış.' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: normalizedUsername,
        name: normalizedUsername,
        password: hashedPassword,
        role: newRole,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(
      {
        success: true,
        user: toSafeUser(newUser),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('User create error:', error);
    return NextResponse.json({ error: 'Kullanıcı oluşturulurken hata oluştu.' }, { status: 500 });
  }
}

/**
 * Bir kullanıcıyı sistemden kalıcı olarak silen DELETE metodu.
 */
export async function DELETE(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Kullanıcı ID'si gereklidir." }, { status: 400 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu.' }, { status: 500 });
  }
}

/**
 * Kullanıcı bilgilerini veya şifresini güncelleyen PATCH metodu.
 */
export async function PATCH(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, username, password, role } = body as {
      id: string;
      username?: string;
      password?: string;
      role?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "Kullanıcı ID'si gereklidir." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    const data: any = {};
    if (username) {
      const normalizedUsername = username.trim().toLowerCase();
      // Başka birinin bu kullanıcı adını kullanıp kullanmadığını kontrol et
      const usernameExists = await prisma.user.findFirst({
        where: { email: normalizedUsername, NOT: { id } }
      });
      if (usernameExists) {
        return NextResponse.json({ error: 'Bu kullanıcı adı zaten başka bir kullanıcı tarafından kullanılıyor.' }, { status: 400 });
      }
      data.email = normalizedUsername;
      data.name = normalizedUsername;
    }
    
    if (password) {
      data.password = bcrypt.hashSync(password, 10);
    }

    if (role && (role === 'admin' || role === 'editor')) {
      data.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      user: toSafeUser(updatedUser)
    }, { status: 200 });

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu.' }, { status: 500 });
  }
}
