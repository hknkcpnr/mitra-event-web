import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function seedUsers(dataDir) {
  const users = readJson(path.join(dataDir, 'users.json'), []);

  if (users.length === 0) {
    const fallbackUsername = (process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'admin').toLowerCase();
    const fallbackHash = process.env.ADMIN_PASSWORD_HASH;

    if (fallbackHash) {
      await prisma.user.upsert({
        where: { email: fallbackUsername },
        update: {},
        create: {
          email: fallbackUsername,
          name: fallbackUsername,
          password: fallbackHash,
          role: 'admin',
        },
      });
    }
    return;
  }

  for (const user of users) {
    const username = String(user.username || user.email || '').trim().toLowerCase();
    if (!username || !user.password) continue;

    await prisma.user.upsert({
      where: { email: username },
      update: {
        password: user.password,
        role: user.role || 'editor',
        name: username,
      },
      create: {
        email: username,
        password: user.password,
        role: user.role || 'editor',
        name: username,
      },
    });
  }
}

async function seedInquiries(dataDir) {
  const inquiries = readJson(path.join(dataDir, 'inquiries.json'), []);
  for (const inquiry of inquiries) {
    await prisma.inquiry.upsert({
      where: { id: String(inquiry.id) },
      update: {
        name: inquiry.name || '',
        email: (inquiry.email || '').toLowerCase(),
        phone: inquiry.phone || null,
        eventType: inquiry.eventType || null,
        message: inquiry.message || '',
        status: inquiry.status || 'beklemede',
        note: inquiry.note || '',
      },
      create: {
        id: String(inquiry.id),
        name: inquiry.name || '',
        email: (inquiry.email || '').toLowerCase(),
        phone: inquiry.phone || null,
        eventType: inquiry.eventType || null,
        message: inquiry.message || '',
        status: inquiry.status || 'beklemede',
        note: inquiry.note || '',
        createdAt: inquiry.date ? new Date(inquiry.date) : new Date(),
      },
    });
  }
}

async function seedEvents(dataDir) {
  const events = readJson(path.join(dataDir, 'events.json'), []);
  for (const event of events) {
    await prisma.event.upsert({
      where: { id: String(event.id) },
      update: {
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : null,
        eventType: event.eventType || 'diger',
        firstName: event.firstName || '',
        lastName: event.lastName || '',
        phone: event.phone || '',
        price: event.price || '',
        paymentStatus: event.paymentStatus || 'beklemede',
        reminderDays: Number.isNaN(Number(event.reminderDays)) ? 0 : Number(event.reminderDays),
      },
      create: {
        id: String(event.id),
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : null,
        eventType: event.eventType || 'diger',
        firstName: event.firstName || '',
        lastName: event.lastName || '',
        phone: event.phone || '',
        price: event.price || '',
        paymentStatus: event.paymentStatus || 'beklemede',
        reminderDays: Number.isNaN(Number(event.reminderDays)) ? 0 : Number(event.reminderDays),
        createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
      },
    });
  }
}

async function seedContentAndStats(dataDir) {
  const content = readJson(path.join(dataDir, 'content.json'), null);
  if (content) {
    await prisma.content.upsert({
      where: { key: 'site_content' },
      update: { value: JSON.stringify(content) },
      create: { key: 'site_content', value: JSON.stringify(content) },
    });

    // Seed Projects
    if (Array.isArray(content.projects)) {
      for (const [index, project] of content.projects.entries()) {
        await prisma.project.upsert({
          where: { id: String(project.id) },
          update: {
            title: project.title || '',
            category: project.category || '',
            description: project.desc || '',
            image: project.img || '',
            order: index,
          },
          create: {
            id: String(project.id),
            title: project.title || '',
            category: project.category || '',
            description: project.desc || '',
            image: project.img || '',
            order: index,
          },
        });
      }
    }

    // Seed Services
    if (Array.isArray(content.services)) {
      for (const [index, service] of content.services.entries()) {
        await prisma.service.upsert({
          where: { id: String(service.id) },
          update: {
            title: service.title || '',
            category: service.category || '',
            description: service.desc || '',
            image: service.img || '',
            order: index,
          },
          create: {
            id: String(service.id),
            title: service.title || '',
            category: service.category || '',
            description: service.desc || '',
            image: service.img || '',
            order: index,
          },
        });
      }
    }

    // Seed Testimonials
    if (Array.isArray(content.testimonials)) {
      for (const [index, testimonial] of content.testimonials.entries()) {
        await prisma.testimonial.upsert({
          where: { id: String(testimonial.id) },
          update: {
            name: testimonial.name || '',
            role: testimonial.role || '',
            quote: testimonial.quote || '',
            image: testimonial.img || '',
            order: index,
          },
          create: {
            id: String(testimonial.id),
            name: testimonial.name || '',
            role: testimonial.role || '',
            quote: testimonial.quote || '',
            image: testimonial.img || '',
            order: index,
          },
        });
      }
    }

    // Seed Gallery
    if (Array.isArray(content.gallery)) {
      await prisma.galleryImage.deleteMany({}); // Clear to prevent duplicates on string url mapping
      for (const [index, item] of content.gallery.entries()) {
        const id = `gal_${index}_${Date.now()}`;
        await prisma.galleryImage.upsert({
          where: { id: id },
          update: {},
          create: {
            id: id,
            url: item.img || '',
            title: item.title || '',
            alt: item.alt || '',
            order: index,
          },
        });
      }
    }
  }

  const stats = readJson(path.join(dataDir, 'stats.json'), null);
  if (stats) {
    await prisma.stat.upsert({
      where: { key: 'analytics' },
      update: { value: JSON.stringify(stats) },
      create: { key: 'analytics', value: JSON.stringify(stats) },
    });
  }
}

async function seedSessionLogs(dataDir) {
  const logs = readJson(path.join(dataDir, 'session_logs.json'), []);
  const currentCount = await prisma.sessionLog.count();
  if (currentCount > 0) return;

  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const userMap = new Map(users.map((u) => [u.email, u.id]));

  for (const log of logs) {
    const username = String(log.username || '').trim().toLowerCase();
    if (!username) continue;

    await prisma.sessionLog.create({
      data: {
        username,
        status: log.status || 'success',
        loginTime: log.loginTime ? new Date(log.loginTime) : new Date(),
        userId: userMap.get(username) || null,
      },
    });
  }
}

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  await seedUsers(dataDir);
  await seedInquiries(dataDir);
  await seedEvents(dataDir);
  await seedContentAndStats(dataDir);
  await seedSessionLogs(dataDir);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
