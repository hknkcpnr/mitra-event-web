"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';

interface Project {
    id: number;
    title: string;
    category: string;
    desc: string;
    img: string;
}

interface ProjectsMeta {
    badge: string;
    titleLine1: string;
    titleLine2: string;
}

interface ProjectsSliderProps {
    data: Project[];
    meta: ProjectsMeta;
    showIndex?: boolean;
}

/**
 * Proje Kaydırıcı (Slider) Bileşeni
 * Swiper kütüphanesi kullanılarak profesyonel ve sorunsuz bir deneyim sunar.
 */
const ProjectsSlider: React.FC<ProjectsSliderProps> = ({ data, meta, showIndex }) => {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    if (!data || data.length === 0) return null;

    return (
        <section id="portföy" className="scroll-mt-24 min-h-screen flex flex-col justify-center py-32 px-6 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div>
                        <span className="text-[#A68BA6] text-xs tracking-[0.4em] uppercase font-bold mb-4 block">{meta?.badge}</span>
                        <h2 className="text-4xl md:text-5xl font-serif">
                            {meta?.titleLine1} <span className="italic font-light">{meta?.titleLine2}</span>
                        </h2>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => swiper?.slidePrev()} 
                            disabled={isBeginning}
                            className={`w-12 h-12 rounded-full border border-[#2D2926]/20 flex items-center justify-center transition-all ${isBeginning ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#2D2926] hover:text-white'}`}
                            aria-label="Geri"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => swiper?.slideNext()} 
                            disabled={isEnd}
                            className={`w-12 h-12 rounded-full border border-[#2D2926]/20 flex items-center justify-center transition-all ${isEnd ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#2D2926] hover:text-white'}`}
                            aria-label="İleri"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Swiper Slider */}
                <div className="w-full relative">
                    <Swiper
                        onSwiper={setSwiper}
                        onSlideChange={(s) => {
                            setIsBeginning(s.isBeginning);
                            setIsEnd(s.isEnd);
                        }}
                        modules={[Navigation]}
                        spaceBetween={30}
                        className="!overflow-visible"
                        grabCursor={true}
                        breakpoints={{
                            // Mobile: 1.2 slides (shows next one partially)
                            320: { slidesPerView: 1.2, spaceBetween: 16 },
                            // Tablet: 2.2 slides
                            768: { slidesPerView: 2.2, spaceBetween: 24 },
                            // Desktop: Exactly 3 slides
                            1024: { slidesPerView: 3, spaceBetween: 30 }
                        }}
                    >
                        {data.map((project, index) => (
                            <SwiperSlide key={project.id || index}>
                                <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden group shadow-xl bg-white transition-all duration-500">
                                    {showIndex && (
                                        <div className="absolute top-6 left-6 z-[30] w-10 h-10 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black shadow-2xl border-2 border-white/30">
                                            {index + 1}
                                        </div>
                                    )}
                                    {project?.img ? (
                                        <Image 
                                            src={project.img} 
                                            alt={project?.title || 'Proje'} 
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-stone-100 flex items-center justify-center text-[#A68BA6]/30 uppercase scale-90">
                                            Görsel Hazırlanıyor
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                                        <span className="text-[#E6DDE6] text-[10px] tracking-widest uppercase font-bold mb-3">{project?.category}</span>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-serif mb-2">{project?.title}</h3>
                                            <p className="font-light text-sm text-white/80 line-clamp-2">{project?.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
            {/* Swiper custom overrides if needed */}
            <style jsx global>{`
                .swiper-slide {
                    height: auto !important;
                }
            `}</style>
        </section>
    );
};

export default ProjectsSlider;
