"use client";
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
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
 * Yapılan projeleri yatay eksende kaydırılabilir kartlar halinde sergiler.
 * Özel kaydırma kontrolleri (sağ/sol) ve estetik geçiş efektleri içerir.
 */
const ProjectsSlider: React.FC<ProjectsSliderProps> = ({ data, meta, showIndex }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const scrollAmount = window.innerWidth > 768 ? 600 : 300;
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const scrollAmount = window.innerWidth > 768 ? 600 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="portföy" className="scroll-mt-24 min-h-screen flex flex-col justify-center py-24 px-6 bg-[#F8F7F5] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <span className="text-[#A68BA6] text-xs tracking-[0.4em] uppercase font-bold mb-4 block">{meta?.badge}</span>
                        <h2 className="text-4xl md:text-5xl font-serif">{meta?.titleLine1} <span className="italic font-light">{meta?.titleLine2}</span></h2>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={scrollLeft} className="w-12 h-12 rounded-full border border-[#2D2926]/20 flex items-center justify-center hover:bg-[#2D2926] hover:text-white transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={scrollRight} className="w-12 h-12 rounded-full border border-[#2D2926]/20 flex items-center justify-center hover:bg-[#2D2926] hover:text-white transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="relative w-full -mx-6 px-6 md:mx-0 md:px-0">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 hide-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {data?.map((project, index) => (
                            <div
                                key={project?.id || index}
                                className="relative flex-none w-[85%] sm:w-[50%] md:w-[40%] lg:w-[32%] aspect-square rounded-[2rem] overflow-hidden group snap-center md:snap-start"
                            >
                                {showIndex && (
                                    <div className="absolute top-6 left-6 z-[30] w-10 h-10 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black shadow-2xl border-2 border-white/30 animate-in zoom-in duration-300">
                                        {index + 1}
                                    </div>
                                )}
                                <img src={project?.img} alt={project?.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="text-[#E6DDE6] text-[10px] tracking-widest uppercase font-bold mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{project?.category}</span>
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-serif mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{project?.title}</h3>
                                        <p className="font-light text-sm text-white/80 line-clamp-2 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">{project?.desc}</p>
                                    </div>
                                </div>
                                <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Adding support for hide-scrollbar class directly here for convenience */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </section>
    );
};

export default ProjectsSlider;
