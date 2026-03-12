import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionWithUser } from '@/lib/auth';

const STATS_KEY = 'analytics';

type StatsShape = {
  daily: Array<{
    date: string;
    visitors: number;
    pageViews: number;
    avgDuration: number;
    bounceRate: number;
  }>;
  summary: {
    totalVisitors: number;
    totalPageViews: number;
    avgSessionDuration?: number;
    avgBounceRate?: number;
    topPages: Array<{ path: string; views: number }>;
  };
};

function getDefaultStats(): StatsShape {
  return {
    daily: [],
    summary: { totalVisitors: 0, totalPageViews: 0, topPages: [] },
  };
}

async function readStatsFromDb(): Promise<StatsShape> {
  const row = await prisma.stat.findUnique({ where: { key: STATS_KEY } });
  if (!row) return getDefaultStats();

  try {
    return JSON.parse(row.value) as StatsShape;
  } catch {
    return getDefaultStats();
  }
}

async function writeStatsToDb(stats: StatsShape) {
  await prisma.stat.upsert({
    where: { key: STATS_KEY },
    update: { value: JSON.stringify(stats) },
    create: { key: STATS_KEY, value: JSON.stringify(stats) },
  });
}

/**
 * Site genel istatistiklerini (Ziyaret, Başvuru, Etkinlik) hesaplayan GET metodu.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const stats = await readStatsFromDb();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error reading stats:', error);
    return NextResponse.json({ error: 'Failed to read stats data' }, { status: 500 });
  }
}

/**
 * Yeni bir ziyareti veya sayfa gösterimini kaydeden POST metodu.
 * Günlük ve genel toplam verilerini anlık olarak günceller.
 */
export async function POST(request: NextRequest) {
  try {
    const { type, path: pagePath } = (await request.json()) as { type?: string; path?: string };
    const today = new Date().toISOString().split('T')[0];
    const stats = await readStatsFromDb();

    if (!stats.daily) stats.daily = [];
    if (!stats.summary) stats.summary = { totalVisitors: 0, totalPageViews: 0, topPages: [] };
    if (!stats.summary.topPages) stats.summary.topPages = [];

    let todayRecord = stats.daily.find((d) => d.date === today);
    if (!todayRecord) {
      todayRecord = {
        date: today,
        visitors: 0,
        pageViews: 0,
        avgDuration: 0,
        bounceRate: 0,
      };
      stats.daily.push(todayRecord);
    }

    if (type === 'visit') {
      todayRecord.visitors = (todayRecord.visitors || 0) + 1;
      stats.summary.totalVisitors = (stats.summary.totalVisitors || 0) + 1;
    }

    todayRecord.pageViews = (todayRecord.pageViews || 0) + 1;
    stats.summary.totalPageViews = (stats.summary.totalPageViews || 0) + 1;

    if (pagePath) {
      const pageRecord = stats.summary.topPages.find((p) => p.path === pagePath);
      if (pageRecord) {
        pageRecord.views += 1;
      } else {
        stats.summary.topPages.push({ path: pagePath, views: 1 });
      }
      stats.summary.topPages.sort((a, b) => b.views - a.views);
      stats.summary.topPages = stats.summary.topPages.slice(0, 10);
    }

    await writeStatsToDb(stats);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}
