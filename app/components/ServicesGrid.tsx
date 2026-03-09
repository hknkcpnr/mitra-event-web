import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Service {
    title: string;
    category: string;
    desc: string;
    img: string;
}

interface ServicesMeta {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
}

interface ServicesGridProps {
    data: Service[];
    meta: ServicesMeta;
    showIndex?: boolean;
}

const ServicesGrid: React.FC<ServicesGridProps> = ({ data, meta, showIndex }) => {
    return (
        <section id="hizmetler" className="scroll-mt-24 min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 bg-[#FDFCFB]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="max-w-xl">
                        <span className="text-[#A68BA6] text-xs tracking-[0.4em] uppercase font-bold mb-6 block">{meta.badge}</span>
                        <h2 className="text-4xl md:text-6xl font-serif">{meta.titleLine1} <br /> {meta.titleLine2}</h2>
                    </div>
                    <p className="text-[#6B6661] max-w-xs text-sm font-light italic">
                        {meta.description}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {data.map((service, idx) => (
                        <div key={idx} className="group relative cursor-pointer">
                            <div className="overflow-hidden rounded-[2.5rem] aspect-[4/5] mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500 relative">
                                {showIndex && (
                                    <div className="absolute top-6 left-6 z-[30] w-10 h-10 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black shadow-2xl border-2 border-white/30 animate-in zoom-in duration-300">
                                        {idx + 1}
                                    </div>
                                )}
                                <img src={service.img} alt={service.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                            </div>
                            <div className="space-y-4 px-2">
                                <span className="text-[#A68BA6] text-[10px] tracking-widest uppercase font-bold">{service.category}</span>
                                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                                    <h3 className="text-3xl font-serif group-hover:italic transition-all">{service.title}</h3>
                                    <div className="w-10 h-10 rounded-full border border-[#2D2926]/10 flex items-center justify-center group-hover:bg-[#2D2926] group-hover:text-white transition-all">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                                <p className="text-[#6B6661] text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-h-0 group-hover:max-h-20 overflow-hidden">
                                    {service.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
