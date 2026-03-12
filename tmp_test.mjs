import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        console.log("MySQL ile bağlantı deneniyor...");
        const data = await prisma.content.findUnique({ where: { key: 'site_content' } });
        console.log(data ? "VERİ ÇEKİLDİ." : "VERİ BOŞ.");
    } catch (e) {
        console.error("PRISMA HATASI:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
