import React from 'react';
import { Instagram, Linkedin, MessageCircle, Mail, MapPin, ArrowRight } from 'lucide-react';

interface FooterProps {
    data: {
        description: string;
        address: string;
        email: string;
        socials: {
            instagram: string;
            linkedin: string;
            whatsapp: string;
        };
        bottomText: string;
        bottomSubtitle: string;
    };
    brand: {
        logo: string;
        logoLight: string;
        siteName: string;
    };
}

/**
 * Site Alt Bilgi (Footer) Bileşeni
 * Marka bilgilerini, iletişim linklerini, sosyal medya hesaplarını ve
 * kurumsal yasal linkleri (KVKK, Çerez Politikası) görüntüler.
 */
const Footer: React.FC<FooterProps> = ({ data, brand }) => {
    const currentYear = new Date().getFullYear();

    if (!data) return null;

    return (
        <footer className="bg-white border-t border-[#2D2926]/5 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">

                    {/* Brand Column */}
                    <div className="space-y-8">
                        {brand?.logo ? (
                            <img
                                src={brand?.logo}
                                alt={brand?.siteName || 'Logo'}
                                className="h-12 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex flex-col leading-none pointer-events-none select-none">
                                <span className="text-3xl font-light tracking-[0.5em] uppercase text-[#2D2926]">{brand?.siteName?.split(' ')[0] || 'MİTRA'}</span>
                                <span className="text-[11px] font-bold tracking-[0.4em] mt-3 text-[#A68BA6]">{brand?.siteName?.split(' ').slice(1).join(' ') || 'EVENT STUDIO'}</span>
                            </div>
                        )}
                        <p className="text-[#6B6661] text-sm font-light leading-relaxed max-w-xs">
                            {data.description}
                        </p>
                        <div className="flex space-x-5">
                            {[
                                { icon: <Instagram size={18} />, href: data.socials?.instagram || "#" },
                                { icon: <Linkedin size={18} />, href: data.socials?.linkedin || "#" },
                                { icon: <MessageCircle size={18} />, href: data.socials?.whatsapp || "#" }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-[#2D2926]/60 hover:bg-[#2D2926] hover:text-white hover:border-[#2D2926] transition-all duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-[#A68BA6]">Kurumsal</h4>
                        <ul className="space-y-4">
                            {['Vizyonumuz', 'Hizmetler', 'Portföy', 'Referanslar', 'İletişim'].map((link) => (
                                <li key={link}>
                                    <a href={`#${link.toLowerCase()}`} className="text-sm font-light text-[#2D2926]/70 hover:text-[#2D2926] hover:translate-x-1 inline-block transition-all duration-300">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-[#A68BA6]">Bize Ulaşın</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group">
                                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm font-light text-[#2D2926]/70 leading-relaxed">
                                    {data.address}
                                </span>
                            </li>
                        </ul>
                    </div>


                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#2D2926]/40 font-medium">
                            © {currentYear} — {data.bottomText}
                        </p>
                        <div className="h-1 w-1 rounded-full bg-stone-200 hidden md:block"></div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#2D2926]/40">
                            {data.bottomSubtitle}
                        </p>
                        {(data as any).mersisNo && (
                            <>
                                <div className="h-1 w-1 rounded-full bg-stone-200 hidden md:block"></div>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-[#2D2926]/40">
                                    MERSİS: {(data as any).mersisNo}
                                </p>
                            </>
                        )}
                        {(data as any).taxNumber && (
                            <>
                                <div className="h-1 w-1 rounded-full bg-stone-200 hidden md:block"></div>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-[#2D2926]/40">
                                    VKN: {(data as any).taxNumber} {(data as any).taxOffice && `— ${(data as any).taxOffice}`}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="flex gap-8">
                        <a href="/kvkk" className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#2D2926]/30 hover:text-[#2D2926] transition-colors">KVKK</a>
                        <a href="/cerez-politikasi" className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#2D2926]/30 hover:text-[#2D2926] transition-colors">Çerez Politikası</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
