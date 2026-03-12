import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const demoContent = {
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
    badgeTitle: 'Özel Anların Mimarı',
    titleLine1: 'Hayallerinizdeki',
    titleLine2: 'Zarif Davetleri',
    titleLine3: 'Tasarlıyoruz',
    description: 'Mitra Event olarak, en değerli günlerinizi estetik, zarafet ve profesyonellik ile unutulmaz birer anıya dönüştürüyoruz.',
    primaryButtonText: 'Randevu Al',
    secondaryButtonText: 'Hikayemizi Keşfet',
    images: [
      { id: 'h1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop', alt: 'Düğün Organizasyon' },
      { id: 'h2', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop', alt: 'Masa Düzeni' },
      { id: 'h3', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop', alt: 'Etkinlik Mekanı' }
    ],
    floatingBox: {
      tag: 'Estetik & Strateji',
      tagLine2: 'Eşsiz Tasarımlar',
      infoTitle: 'Danışmanlık',
      infoSubtitle: 'Kişiye Özel Konsept'
    }
  },
  philosophy: {
    quoteLine1: 'Zarafet, ayrıntıda gizli',
    quoteLine2: 'Gerçek lüks sadeliktedir.',
    description: 'Bizim için her etkinlik bir sanat eseridir. Modern bakış açımızla, klasik zarafeti harmanlayarak size özel bir dünya yaratıyoruz.',
    bgImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2014&auto=format&fit=crop'
  },
  services: [
    {
      title: 'Düğün Planlama',
      category: 'Organizasyon',
      desc: 'En mutlu gününüzü A’dan Z’ye profesyonel ekibimizle planlıyoruz.',
      img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop'
    },
    {
      title: 'Kurumsal Davetler',
      category: 'Etkinlik',
      desc: 'Şirket prestijinizi yansıtan profesyonel kurumsal organizasyonlar.',
      img: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2162&auto=format&fit=crop'
    },
    {
      title: 'Konsept Tasarımı',
      category: 'Kreatif',
      desc: 'Size özel temalar ve benzersiz dekorasyon fikirleri geliştiriyoruz.',
      img: 'https://images.unsplash.com/photo-1478146896981-b80fe463b33c?q=80&w=2070&auto=format&fit=crop'
    }
  ],
  servicesMeta: {
    badge: 'Neler Yapıyoruz?',
    titleLine1: 'İhtişamlı',
    titleLine2: 'Hizmetlerimiz',
    description: 'Etkinliğinizin her aşamasında yanınızdayız. Profesyonel kadromuzla yanınızdayız.'
  },
  testimonials: [
    {
      id: 1,
      name: 'Aslı Yılmaz',
      role: 'Gelin',
      quote: 'Düğünüm tam hayal ettiğim gibiydi. Mitra Event ekibi her detayla inanılmaz ilgilendi. Teşekkürler!',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop'
    }
  ],
  testimonialsMeta: {
    badge: 'Müşteri Memnuniyeti',
    titleLine1: 'Bizi Tercih Edenlerden',
    titleLine2: 'Mutlu Hikayeler',
    description: 'Başarılarımızı müşterilerimizin gülümsemesiyle ölçüyoruz.'
  },
  projects: [
    {
      id: 1,
      title: 'Boğazda Gala',
      category: 'Kurumsal',
      desc: 'Eşsiz Boğaz manzarası eşliğinde görkemli bir akşam yemeği.',
      img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop'
    }
  ],
  projectsMeta: {
    badge: 'Portföyümüz',
    titleLine1: 'İmza Attığımız',
    titleLine2: 'Özel Projeler'
  },
  gallery: [
    { img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop', title: 'Galeri 1' },
    { img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop', title: 'Galeri 2' }
  ],
  footer: {
    description: 'Mitra Event, estetik ve zarafeti etkinliklerinize taşıyan butik bir organizasyon stüdyosudur.',
    address: 'Nişantaşı, İstanbul',
    email: 'hello@mitraevent.com',
    socials: {
      instagram: 'https://instagram.com/mitraevent',
      linkedin: '#',
      whatsapp: 'https://wa.me/905000000000'
    },
    bottomText: 'Mitra Event Studio',
    bottomSubtitle: 'Kreatif Organizasyon & Planlama'
  },
  systemSettings: {
    maintenanceMode: 'false',
    maxImageSize: '10'
  }
};

async function main() {
  console.log('Demo içerikler veritabanına yazılıyor...');
  await prisma.content.upsert({
    where: { key: 'site_content' },
    update: { value: JSON.stringify(demoContent) },
    create: { key: 'site_content', value: JSON.stringify(demoContent) }
  });
  console.log('Başarılı: Demo verileri yüklendi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
