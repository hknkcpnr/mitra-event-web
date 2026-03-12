import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionWithUser } from '@/lib/auth';

/**
 * Son yapılan yönetici girişlerini (login history) listeleyen GET metodu.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const logs = await prisma.sessionLog.findMany({
    orderBy: { loginTime: 'desc' },
    select: {
      id: true,
      username: true,
      loginTime: true,
      status: true,
    },
  });

  return NextResponse.json(
    logs.map((log) => ({
      ...log,
      loginTime: log.loginTime.toISOString(),
    })),
    { status: 200 },
  );
}
