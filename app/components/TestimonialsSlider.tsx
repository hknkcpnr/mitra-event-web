"use client";
import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    quote: string;
    img: string;
}

interface TestimonialsMeta {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
}

interface TestimonialsSliderProps {
    data: Testimonial[];
    meta: TestimonialsMeta;
    showIndex?: boolean;
}

/**
 * Müşteri Yorumları (Testimonials) Kaydırıcı Bileşeni
 * Müşterilerden gelen geri bildirimleri otomatik geçişli bir kart 
 * yapısı (slider) içinde sunar.
 */
const TestimonialsSlider: React.FC<TestimonialsSliderProps> = ({ data, meta, showIndex }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!data || data.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % data.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [data]);

    if (!data || data.length === 0) return null;

    return (
        <section id="testimonials" className="scroll-mt-24 py-24 bg-[#E6DDE6]/10 relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E6DDE6] rounded-full mix-blend-multiply filter blur-[80px] opacity-30 translate-x-1/3 -translate-y-1/3"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column - Meta */}
                    <div className="max-w-lg">
                        <span className="block text-xs font-bold tracking-[0.2em] text-[#2D2926]/60 mb-4 uppercase">
                            {meta?.badge}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#2D2926] leading-[1.1] mb-6">
                            {meta?.titleLine1} <br />
                            <span className="font-light italic text-[#2D2926]/70">{meta?.titleLine2}</span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            {meta?.description}
                        </p>
                    </div>

                    {/* Right Column - Slider */}
                    <div className="relative">
                        {/* Large Decorative Quote Icon */}
                        <Quote size={120} className="absolute -top-10 -left-10 text-[#2D2926]/5 -rotate-12 z-0" />

                        <div className="relative z-10 w-full h-[320px] md:h-[280px]">
                            {data?.map((testimonial, idx) => (
                                <div
                                    key={testimonial?.id || idx}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === activeIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                        }`}
                                >
                                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-[#2D2926]/5 border border-[#2D2926]/5 h-full flex flex-col justify-between relative">
                                        {showIndex && (
                                            <div className="absolute top-4 left-4 z-[30] w-8 h-8 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg border border-white/20">
                                                {idx + 1}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-start justify-between mb-8">
                                                <Quote size={32} className="text-[#2D2926]/20 shrink-0" />

                                                <div className="flex items-center justify-end gap-4 text-right">
                                                    <div className="hidden sm:block">
                                                        <h4 className="text-[#2D2926] font-bold text-lg">{testimonial?.name}</h4>
                                                        <p className="text-[#2D2926]/50 text-xs md:text-sm font-medium tracking-wide uppercase">{testimonial?.role}</p>
                                                    </div>
                                                    {testimonial?.img && (
                                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#E6DDE6] shrink-0">
                                                            <img
                                                                src={testimonial?.img}
                                                                alt={testimonial?.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="block sm:hidden text-left ml-2">
                                                        <h4 className="text-[#2D2926] font-bold text-sm">{testimonial?.name}</h4>
                                                        <p className="text-[#2D2926]/50 text-[10px] font-medium tracking-wide uppercase">{testimonial?.role}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-[#2D2926]/80 text-xl md:text-2xl leading-relaxed italic font-light">
                                                "{testimonial?.quote}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center flex-wrap gap-2 mt-8 md:mt-12 relative z-10">
                            {data.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`h-2 transition-all duration-300 rounded-full ${index === activeIndex
                                        ? 'w-6 bg-[#2D2926]'
                                        : 'w-2 bg-[#2D2926]/20 hover:bg-[#2D2926]/40'
                                        }`}
                                    aria-label={`Yorum ${index + 1} göster`}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSlider;
