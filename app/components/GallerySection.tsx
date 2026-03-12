'use client';
import React from 'react';

interface GalleryItem {
    img: string;
    alt: string;
}

interface GallerySectionProps {
    images: GalleryItem[];
}

/**
 * Galeri Bölümü Bileşeni
 * Etkinliklerden karelerin sergilendiği, estetik tasarımlı 
 * resim ızgarasını (grid) oluşturur.
 */
const GallerySection: React.FC<GallerySectionProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = React.useState<GalleryItem | null>(null);

    if (!images || images.length === 0) return null;

    return (
        <section id="galeri" className="py-24 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto mb-16 px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#A68BA6] block">Anlardan Kareler</span>
                        <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                            Etkinlik <br /> <span className="italic font-light text-[#A68BA6]">Galerisi</span>
                        </h2>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedImage(item)}
                            className={`group relative overflow-hidden rounded-3xl aspect-[4/5] bg-stone-100 cursor-pointer ${index % 4 === 1 || index % 4 === 2 ? 'md:translate-y-12' : ''
                                }`}
                        >
                            <img
                                src={item.img}
                                alt={item.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase border border-white/30 px-6 py-2 rounded-full backdrop-blur-sm">
                                    GÖRÜNTÜLE
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox / Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full h-[80vh] animate-zoomIn">
                        <img 
                            src={selectedImage.img} 
                            alt={selectedImage.alt} 
                            className="w-full h-full object-contain"
                        />
                        <button 
                            className="absolute top-4 right-4 text-white hover:text-[#A68BA6] transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GallerySection;
