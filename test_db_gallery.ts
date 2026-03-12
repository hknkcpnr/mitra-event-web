import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const images = await prisma.galleryImage.findMany({
      take: 5
    });
    console.log('Successfully fetched images:', images.length);
  } catch (err: any) {
    console.error('Prisma fetch error:', err.message);
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
