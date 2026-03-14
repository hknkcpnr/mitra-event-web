import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const content = await prisma.content.findUnique({
    where: { key: 'site_content' }
  });

  if (content) {
    const data = JSON.parse(content.value);
    if (data.brand) {
      data.brand.favicon = '/favicon.png';
    }
    await prisma.content.update({
      where: { key: 'site_content' },
      data: {
        value: JSON.stringify(data)
      }
    });
    console.log('Database updated successfully: favicon set to /favicon.png');
  } else {
    console.log('Content not found in database');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
