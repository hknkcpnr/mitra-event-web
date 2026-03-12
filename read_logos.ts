import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.content.findUnique({
    where: { key: 'site_content' },
  });

  if (row) {
    const data = JSON.parse(row.value);
    console.log('Logo URL:', data.brand?.logo);
    console.log('Logo Light URL:', data.brand?.logoLight);
  } else {
    console.log('Content row not found');
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
