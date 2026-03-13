import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionWithUser } from '@/lib/auth';

type EventPayload = {
  id?: string;
  title?: string;
  date?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  paymentStatus?: string;
  reminderDays?: string | number;
  price?: string;
  deposit?: string;
  eventType?: string;
};

function toResponseEvent(event: {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  eventType: string;
  firstName: string;
  lastName: string;
  phone: string;
  price: string;
  paymentStatus: string;
  reminderDays: number;
  createdAt: Date;
  updatedAt: Date;
  deposit?: string;
}) {
  return {
    id: event.id,
    title: event.title,
    date: event.date ? event.date.toISOString().split('T')[0] : null,
    description: event.description ?? '',
    eventType: event.eventType,
    firstName: event.firstName,
    lastName: event.lastName,
    phone: event.phone,
    price: event.price,
    deposit: event.deposit ?? '',
    paymentStatus: event.paymentStatus,
    reminderDays: event.reminderDays,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

async function ensureAuthorized(request: NextRequest) {
  const session = await getSessionWithUser(request);
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  return null;
}

/**
 * Tüm etkinlikleri/organizasyonları listeleyen GET metodu.
 */
export async function GET(request: NextRequest) {
  const authError = await ensureAuthorized(request);
  if (authError) return authError;

  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
  return NextResponse.json(events.map(toResponseEvent), { status: 200 });
}

/**
 * Yeni bir etkinlik/organizasyon oluşturan POST metodu.
 */
export async function POST(request: NextRequest) {
  const authError = await ensureAuthorized(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as EventPayload;
    const { title, date, description, firstName, lastName, phone, paymentStatus, reminderDays, price, deposit, eventType } = body;

    if (!title || !date || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'Gerekli alanları doldurunuz.' }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title: title.trim(),
        date: new Date(date),
        description: description || '',
        eventType: eventType || 'diğer',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        price: price || '',
        deposit: paymentStatus === 'alindi' ? '' : (deposit || ''),
        paymentStatus: paymentStatus || 'beklemede',
        reminderDays: Number.isNaN(Number(reminderDays)) ? 0 : Number(reminderDays),
      } as any,
    });

    return NextResponse.json({ success: true, event: toResponseEvent(newEvent) }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Organizasyon eklenirken hata oluştu.' }, { status: 500 });
  }
}

/**
 * Mevcut bir etkinliğin detaylarını güncelleyen PATCH metodu.
 */
export async function PATCH(request: NextRequest) {
  const authError = await ensureAuthorized(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as EventPayload;
    const { id, title, date, description, firstName, lastName, phone, paymentStatus, reminderDays, price, deposit, eventType } = body;

    if (!id) {
      return NextResponse.json({ error: "Organizasyon ID'si gerekli." }, { status: 400 });
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Organizasyon bulunamadı.' }, { status: 404 });
    }

    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date: date ? new Date(date) : null }),
      ...(description !== undefined && { description }),
      ...(eventType !== undefined && { eventType }),
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(price !== undefined && { price }),
      ...(deposit !== undefined && { deposit }),
      ...(paymentStatus !== undefined && { paymentStatus }),
      ...(reminderDays !== undefined && {
        reminderDays: Number.isNaN(Number(reminderDays)) ? existing.reminderDays : Number(reminderDays),
      }),
    };

    if (paymentStatus === 'alindi') {
      updateData.deposit = '';
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, event: toResponseEvent(updatedEvent) }, { status: 200 });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Organizasyon güncellenirken hata oluştu.' }, { status: 500 });
  }
}

/**
 * Bir etkinliği takvimden silen DELETE metodu.
 */
export async function DELETE(request: NextRequest) {
  const authError = await ensureAuthorized(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Organizasyon ID'si gerekli." }, { status: 400 });
    }

    const existing = await prisma.event.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Organizasyon bulunamadı.' }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Organizasyon silinirken hata oluştu.' }, { status: 500 });
  }
}
