import React from 'react';
import dynamic from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import PhilosophySection from './components/PhilosophySection';
import ServicesGrid from './components/ServicesGrid';

// Dynamic imports for off-screen components to improve initial TTI and LCP
const ProjectsSlider = dynamic(() => import('./components/ProjectsSlider'), { 
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-3xl m-6" /> 
});
const TestimonialsSlider = dynamic(() => import('./components/TestimonialsSlider'), { 
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-3xl m-6" /> 
});
const GallerySection = dynamic(() => import('./components/GallerySection'), { 
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-3xl m-6" /> 
});
const InquiryForm = dynamic(() => import('./components/InquiryForm'), { 
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-3xl m-6" /> 
});
const Footer = dynamic(() => import('./components/Footer'), { 
  loading: () => <div className="h-64 bg-gray-900/5 animate-pulse" /> 
});

// Use Next.js Revalidate for edge caching - increased to 1 hour for better performance
export const revalidate = 3600; 

/**
 * Ana Web Sayfası (Landing Page)
 * Sunucu tarafında (SSR) tüm içerikleri çeker ve bölümleri oluşturur.
 * Bakım modu aktifse ziyaretçileri bilgilendirme ekranına yönlendirir.
 */
const App = async () => {
  // SSR: Sunucu taraflı içerik çekimi.
  let siteData = null;

  try {
    const contentRow = await prisma.content.findUnique({ where: { key: 'site_content' } });
    if (contentRow && contentRow.value) {
        siteData = JSON.parse(contentRow.value);
    }
  } catch (error) {
    console.error("Error fetching content data from Prisma:", error);
  }

  if (!siteData || siteData.systemSettings?.maintenanceMode === 'true') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] text-[#2D2926] font-sans px-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#FFF7ED] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] blur-3xl" />
           <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FFF7ED]/60 rounded-[60%_40%_30%_70%_/_50%_60%_50%_40%] blur-3xl" />
        </div>

        <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
           <div className="h-px w-24 bg-[#2D2926] mx-auto opacity-20"></div>
           <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 lowercase">
                mitra <span className="font-light text-gray-400">event</span>
              </h1>
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-gray-400">Şu an bakımdayız</p>
           </div>
           
           <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-500 leading-relaxed">
                Size daha iyi bir deneyim sunabilmek için web sitemizde güncellemeler yapıyoruz. 
                Çok yakında tekrar yayında olacağız.
              </p>
           </div>

           <div className="flex flex-col items-center gap-6 pt-4">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D2926]/40">Hazırlanıyor</span>
              </div>
              <div className="h-px w-24 bg-[#2D2926] mx-auto opacity-20"></div>
           </div>
        </div>
        
        <p className="absolute bottom-10 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] z-10">© 2026 Mitra Event</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926] font-sans selection:bg-[#E6DDE6]">
      <NavBar
        whatsappUrl={siteData.contact?.whatsappUrl}
        brand={siteData.brand}
      />
      <HeroSection data={siteData.hero} />
      <PhilosophySection data={siteData.philosophy} />
      <ServicesGrid data={siteData.services} meta={siteData.servicesMeta} />
      <TestimonialsSlider data={siteData.testimonials} meta={siteData.testimonialsMeta} />
      <ProjectsSlider data={siteData.projects} meta={siteData.projectsMeta} />
      <GallerySection images={siteData.gallery} />
      <InquiryForm data={siteData.contact} />
      <Footer data={siteData.footer} brand={siteData.brand} />
    </div>
  );
};

export default App;
