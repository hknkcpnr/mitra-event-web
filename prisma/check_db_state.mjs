import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        const row = await prisma.content.findUnique({ where: { key: 'site_content' } });
        if (row) {
            console.log("Record ID:", row.id);
            console.log("Value Preview:", row.value.substring(0, 100));
            const data = JSON.parse(row.value);
            console.log("Maintenance Mode:", data.systemSettings?.maintenanceMode);
        } else {
            console.log("NO RECORD FOUND for 'site_content'");
        }
    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
