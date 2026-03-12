'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface NavBarProps {
    whatsappUrl: string;
    brand: {
        logo: string;
        logoLight: string;
        siteName: string;
    };
}

const navLinks = [
    { label: 'Vizyonumuz', href: 'vizyonumuz' },
    { label: 'Hizmetler', href: 'hizmetler' },
    { label: 'Portföy', href: 'portföy' },
    { label: 'Galeri', href: 'galeri' },
    { label: 'İletişim', href: 'iletişim' },
];

/**
 * Navigasyon Menüsü (NavBar) Bileşeni
 * Sayfa genelinde sabit kalarak (sticky) bölümler arası geçişi sağlar.
 * Kaydırma (scroll) durumuna göre arka plan ve logo değiştirme özelliğine sahiptir.
 * Mobil menü ve WhatsApp entegrasyonu sunar.
 */
const NavBar: React.FC<NavBarProps> = ({ whatsappUrl, brand }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToSection = (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsMenuOpen(false);

        // If we are not on the home page, redirect to home page with anchor
        if (window.location.pathname !== '/') {
            window.location.href = `/#${id}`;
            return;
        }

        const target = document.getElementById(id);
        const nav = document.querySelector('nav');
        if (target) {
            const navHeight = nav ? nav.getBoundingClientRect().height : 80;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-500 px-3 md:px-12 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <a href="/" className="flex flex-col group cursor-pointer" onClick={(e) => {
                        if (window.location.pathname === '/') {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}>
                        {brand?.logo ? (
                            <div className={`relative transition-all duration-500 ${scrolled ? 'h-12 md:h-14 w-36 md:w-44' : 'h-18 md:h-22 w-48 md:w-60'}`}>
                                <Image
                                    src={scrolled ? brand.logo : (brand.logoLight || brand.logo)}
                                    alt={brand.siteName || "Logo"}
                                    fill
                                    priority
                                    className="object-contain object-left transition-all duration-300"
                                />
                            </div>
                        ) : (
                            <>
                                <span className={`text-xl md:text-2xl font-light tracking-[0.4em] uppercase transition-colors duration-300 ${scrolled ? 'text-[#2D2926]' : 'text-[#2D2926]'}`}>{brand?.siteName?.split(' ')[0] || 'MİTRA'}</span>
                                <span className="text-[10px] font-bold tracking-[0.3em] text-[#A68BA6] uppercase">{brand?.siteName?.split(' ').slice(1).join(' ') || 'Event Studio'}</span>
                            </>
                        )}
                    </a>

                    {/* Desktop Menu */}
                    <div className={`hidden md:flex items-center space-x-12 transition-all duration-500 ${!scrolled ? 'md:-mt-4' : ''}`}>
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={`#${link.href}`}
                                onClick={(e) => scrollToSection(link.href, e)}
                                className="text-[11px] font-bold tracking-[0.2em] uppercase hover:text-[#A68BA6] transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-[#2D2926] text-white px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-[#4A4541] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
                            <MessageCircle size={14} className="text-[#25D366] fill-[#25D366]/20" />
                            İletişim İçin Tıkla
                        </a>
                    </div>

                    <button className="md:hidden text-[#2D2926] p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[40] transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />
                <div className="relative h-full flex flex-col items-center justify-center space-y-8 px-12 text-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={`#${link.href}`}
                            onClick={(e) => scrollToSection(link.href, e)}
                            className="text-2xl font-serif italic text-[#2D2926] hover:text-[#A68BA6] transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="pt-8 w-full">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-[#2D2926] text-white py-5 rounded-2xl text-xs font-bold tracking-widest uppercase shadow-2xl"
                        >
                            <MessageCircle size={20} className="text-[#25D366] fill-[#25D366]/20" />
                            WHATSAPP İLE İLETİŞİME GEÇ
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavBar;
