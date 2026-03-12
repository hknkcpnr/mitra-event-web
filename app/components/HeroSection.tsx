import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface HeroData {
    badgeTitle: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    images: { id: string; url: string; alt: string }[];
    floatingBox: { tag: string; tagLine2: string; infoTitle: string; infoSubtitle: string };
}

interface HeroSectionProps {
    data: HeroData;
}

/**
 * Hero (Giriş) Bölümü Bileşeni
 * Sayfanın en üstünde yer alan ana karşılama alanıdır.
 * Büyük başlıklar, açıklama metni ve estetik bir resim dizimi (puzzle grid) içerir.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
    return (
        <section className="relative min-h-[auto] lg:min-h-screen flex items-center px-6 md:px-12 pt-32 lg:pt-28 pb-12 lg:pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                {/* Text Content */}
                <div className="lg:col-span-6 z-10 text-center lg:text-left">
                    <div className="overflow-hidden mb-6 lg:mb-8">
                        <span className="inline-block text-[#A68BA6] text-[10px] lg:text-xs tracking-[0.5em] uppercase font-bold animate-slideIn">{data?.badgeTitle}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-[5vw] font-serif leading-[1.1] lg:leading-[1] mb-8 lg:mb-10 animate-fadeIn">
                        {data?.titleLine1} <br className="hidden lg:block" />
                        <span className="italic font-light">{data?.titleLine2}</span> <br className="hidden lg:block" />
                        {data?.titleLine3}
                    </h1>
                    <p className="text-[#6B6661] text-base lg:text-lg font-light leading-relaxed mb-10 lg:mb-12 max-w-md mx-auto lg:mx-0 animate-fadeIn opacity-80">
                        {data?.description}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-8 animate-fadeIn">
                        {/* Primary CTA: Luxury Aesthetic */}
                        <button className="relative group w-full sm:w-auto overflow-hidden bg-[#2D2926] text-white px-12 py-5 rounded-full text-[10px] lg:text-[11px] font-bold tracking-[0.4em] uppercase transition-all duration-500 hover:shadow-2xl hover:shadow-[#A68BA6]/30 hover:-translate-y-1 active:scale-95">
                            <span className="relative z-10">{data?.primaryButtonText}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                        </button>
                        
                        {/* Secondary CTA: Elegant Minimalist */}
                        <button className="group relative flex items-center space-x-6 text-[#2D2926] py-2 lg:py-4 transition-all duration-300 hover:text-[#A68BA6]">
                            <span className="relative text-[10px] lg:text-[11px] font-bold tracking-[0.3em] uppercase after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#A68BA6] after:origin-left after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-500">
                                {data?.secondaryButtonText}
                            </span>
                            <div className="w-10 h-10 rounded-full border border-[#2D2926]/10 flex items-center justify-center group-hover:border-[#A68BA6] group-hover:bg-[#A68BA6] group-hover:text-white transition-all duration-500 group-hover:rotate-45">
                                <ArrowRight size={16} />
                            </div>
                        </button>
                    </div>
                    
                    {/* Elegant Tagline under buttons */}
                    <div className="mt-10 opacity-40 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                        <p className="text-[10px] tracking-[0.3em] uppercase flex items-center justify-center lg:justify-start gap-4">
                            <span className="w-8 h-[1px] bg-[#2D2926]"></span>
                            Hayalinizdeki anlar, sanatla buluşuyor
                        </p>
                    </div>
                </div>

                {/* Puzzle Image Grid */}
                <div className="lg:col-span-6 relative mt-10 lg:mt-0">
                    <div className="grid grid-cols-12 grid-rows-12 gap-3 lg:gap-4 h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] animate-puzzleReveal">
                        {/* Piece 1: Large Center-Left */}
                        <div className="col-span-7 row-span-8 overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl relative group">
                            <Image
                                src={data?.images?.[0]?.url || '/placeholder.jpg'}
                                alt={data?.images?.[0]?.alt || ''}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                                className="w-full h-full object-cover animate-zoom-in origin-center"
                            />
                            <div className="absolute inset-0 bg-[#A68BA6]/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        {/* Piece 2: Top Right Small */}
                        <div className="col-span-5 row-span-4 overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl mt-4 lg:mt-8 relative">
                            <Image
                                src={data?.images?.[1]?.url || '/placeholder.jpg'}
                                alt={data?.images?.[1]?.alt || ''}
                                fill
                                sizes="(max-width: 768px) 100vw, 30vw"
                                loading="lazy"
                                className="w-full h-full object-cover animate-zoom-out origin-top-right"
                            />
                        </div>

                        {/* Piece 3: Bottom Right Long */}
                        <div className="col-span-5 row-span-7 overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl -mt-2 lg:-mt-4 relative">
                            <Image
                                src={data?.images?.[2]?.url || '/placeholder.jpg'}
                                alt={data?.images?.[2]?.alt || ''}
                                fill
                                sizes="(max-width: 768px) 100vw, 30vw"
                                loading="lazy"
                                className="w-full h-full object-cover animate-zoom-in origin-bottom-left"
                            />
                        </div>

                        {/* Piece 4: Bottom Left Small Accent */}
                        <div className="col-start-2 col-span-5 row-span-3 overflow-hidden rounded-2xl lg:rounded-3xl shadow-lg relative -mt-2 lg:-mt-4">
                            <div className="absolute inset-0 bg-[#E6DDE6] flex items-center justify-center p-4 lg:p-6 text-center">
                                <p className="text-[8px] lg:text-[10px] font-bold tracking-[0.2em] uppercase text-[#A68BA6] leading-relaxed">
                                    {data?.floatingBox?.tag} <br /> {data?.floatingBox?.tagLine2}
                                </p>
                            </div>
                        </div>

                        {/* Decorative Floating Elements */}
                        <div className="absolute -top-10 -right-10 w-24 lg:w-32 h-24 lg:h-32 bg-[#E6DDE6]/40 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 lg:w-48 h-32 lg:h-48 bg-[#A68BA6]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                    </div>
                    {/* Floating Info Tag */}
                    <div className="absolute bottom-1/4 -left-6 lg:-left-12 bg-white/90 backdrop-blur-md p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-2xl border border-white/50 hidden md:block animate-fadeIn" style={{ animationDelay: '1s' }}>
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="w-1 h-8 lg:h-10 bg-[#A68BA6] rounded-full"></div>
                            <div>
                                <p className="text-[8px] lg:text-[9px] font-bold tracking-widest uppercase text-[#A68BA6] mb-0.5 lg:mb-1">{data?.floatingBox?.infoTitle}</p>
                                <h3 className="text-xs lg:text-sm font-serif italic">{data?.floatingBox?.infoSubtitle}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
