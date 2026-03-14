
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const content = await prisma.content.findUnique({
    where: { key: 'site_content' },
  });

  if (!content) {
    console.log('Site content not found in database.');
    return;
  }

  try {
    const data = JSON.parse(content.value);
    console.log('Maintenance Mode:', data.systemSettings?.maintenanceMode);
    console.log('Full Content structure check:', !!data);
  } catch (e) {
    console.log('Error parsing site content:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
