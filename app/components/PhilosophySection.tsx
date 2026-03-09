import React from 'react';
import { Flower2 } from 'lucide-react';

interface PhilosophyData {
    quoteLine1: string;
    quoteLine2: string;
    description: string;
    bgImage?: string;
}

interface PhilosophySectionProps {
    data: PhilosophyData;
}

const PhilosophySection: React.FC<PhilosophySectionProps> = ({ data }) => {
    return (
        <section id="kürasyon" className="relative scroll-mt-24 min-h-[80vh] flex flex-col justify-center py-32 px-6 bg-white border-y border-stone-100 overflow-hidden">
            {/* Background Image with Low Opacity */}
            {data.bgImage && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={data.bgImage}
                        alt="Background"
                        className="w-full h-full object-cover opacity-[0.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-40"></div>
                </div>
            )}

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <Flower2 className="mx-auto text-[#A68BA6] mb-8 w-12 h-12 opacity-50" />
                <h2 className="text-3xl md:text-5xl font-serif italic mb-10 leading-tight text-[#2D2926]">
                    {data.quoteLine1} <br /> {data.quoteLine2}
                </h2>
                <div className="w-16 h-[1px] bg-[#A68BA6] mx-auto mb-10"></div>
                <p className="text-[#6B6661] text-lg font-light max-w-2xl mx-auto leading-relaxed italic">
                    {data.description}
                </p>
            </div>
        </section>
    );
};

export default PhilosophySection;
