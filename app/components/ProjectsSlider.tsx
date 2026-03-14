"use client";
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
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
    const [activeIndex, setActiveIndex] = React.useState(0);

    // Aktif indeksi kaydırıcı konumuyla eşle
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const items = Array.from(container.children) as HTMLElement[];
            if (items[activeIndex]) {
                container.scrollTo({
                    left: items[activeIndex].offsetLeft - (window.innerWidth < 768 ? 24 : 0),
                    behavior: 'smooth'
                });
            }
        }
    }, [activeIndex]);

    const scrollLeft = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const scrollRight = () => {
        setActiveIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
    };

    // Manuel kaydırmada indeksi güncelle (Opsiyonel ama stabilite için iyi)
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const items = Array.from(container.children) as HTMLElement[];
            const scrollLeft = container.scrollLeft;
            
            const newIndex = items.reduce((prev, curr, idx) => {
                return Math.abs(curr.offsetLeft - scrollLeft) < Math.abs(items[prev].offsetLeft - scrollLeft) 
                    ? idx : prev;
            }, 0);
            
            if(newIndex !== activeIndex) {
                 // Sadece çok gerekliyse state güncellemesi yapılabilir
                 // Ama butona odaklanmak için şimdilik pasif bırakıyoruz.
            }
        }
    };

    return (
        <section id="portföy" className="scroll-mt-24 min-h-screen flex flex-col justify-center py-32 px-6 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div>
                        <span className="text-[#A68BA6] text-xs tracking-[0.4em] uppercase font-bold mb-4 block">{meta?.badge}</span>
                        <h2 className="text-4xl md:text-5xl font-serif">
                            {meta?.titleLine1} <span className="italic font-light">{meta?.titleLine2}</span>
                        </h2>
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={scrollLeft} 
                            disabled={activeIndex === 0}
                            className={`w-12 h-12 rounded-full border border-[#2D2926]/20 flex items-center justify-center transition-all ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#2D2926] hover:text-white'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={scrollRight} 
                            disabled={activeIndex === data.length - 1}
                            className={`w-12 h-12 rounded-full border border-[#2D2926]/20 flex items-center justify-center transition-all ${activeIndex === data.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#2D2926] hover:text-white'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="relative w-full">
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {data?.map((project, index) => (
                            <div
                                key={project?.id || index}
                                className="relative flex-shrink-0 w-[85vw] sm:w-[280px] md:w-[320px] lg:w-[350px] aspect-[4/5] rounded-[3rem] overflow-hidden group snap-start shadow-xl bg-white transition-all duration-500"
                            >
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
                                        sizes="(max-width: 768px) 85vw, 350px"
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
                        ))}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
        </section>
    );
};

export default ProjectsSlider;
