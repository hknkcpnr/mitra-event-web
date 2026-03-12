import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const defaultContent = {
  brand: {
    siteName: 'Mitra Event',
    logo: '',
    logoLight: ''
  },
  contact: {
    whatsappUrl: 'https://wa.me/905000000000',
    email: 'info@mitraevent.com',
    phone: '+90 500 000 00 00'
  },
  hero: {
    title: 'Hayallerinizdeki Etkinliği Tasarlıyoruz',
    subtitle: 'Mitra Event ile özel günlerinizi unutulmaz kılıyoruz.',
    img: ''
  },
  philosophy: {
    title: 'Felsefemiz',
    desc: 'Her detayda mükemmellik ve estetik arıyoruz.'
  },
  services: [],
  servicesMeta: { title: 'Hizmetlerimiz', subtitle: 'Neler Yapıyoruz?' },
  testimonials: [],
  testimonialsMeta: { title: 'Müşteri Yorumları', subtitle: 'Hakkımızda Neler Dediler?' },
  projects: [],
  projectsMeta: { title: 'Projelerimiz', subtitle: 'Gerçekleştirdiğimiz Bazı İşler' },
  gallery: [],
  footer: {
    description: 'Mitra Event, etkinlik planlama ve organizasyon konusunda uzmanlaşmış bir kreatif stüdyodur.',
    address: 'İstanbul, Türkiye',
    email: 'info@mitraevent.com',
    socials: {
      instagram: '#',
      linkedin: '#',
      whatsapp: '#'
    },
    bottomText: 'Mitra Event Studio',
    bottomSubtitle: 'Tüm Hakları Saklıdır'
  },
  systemSettings: {
    maintenanceMode: 'false',
    maxImageSize: '10'
  }
};

async function main() {
  console.log('Veritabanına varsayılan içerik ekleniyor...');
  await prisma.content.upsert({
    where: { key: 'site_content' },
    update: { value: JSON.stringify(defaultContent) },
    create: { key: 'site_content', value: JSON.stringify(defaultContent) }
  });
  console.log('Başarılı: "site_content" oluşturuldu.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
