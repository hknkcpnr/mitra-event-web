'use client';

import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function CookieContent({ siteData }: { siteData: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        setScrolled(window.scrollY > 50);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926] font-sans">
            <NavBar
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                scrolled={scrolled || isMenuOpen}
                whatsappUrl={siteData.contact.whatsappUrl}
                brand={siteData.brand}
            />

            <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#A68BA6] block mb-4">Hukuki Bilgilendirme</span>
                    <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-8">
                        Çerez (Cookie) <br />
                        <span className="italic font-light text-[#A68BA6]">Politikası</span>
                    </h1>
                    <div className="h-px w-24 bg-[#2D2926]/20 mx-auto"></div>
                </div>

                <div className="prose prose-stone max-w-none space-y-12 text-[#6B6661] leading-relaxed">
                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">1. Çerez Nedir?</h2>
                        <p>
                            Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır.
                            <strong> {siteData.brand.siteName}</strong> olarak, ziyaretçilerimizin kullanıcı deneyimini iyileştirmek ve sitemizin verimli çalışmasını sağlamak amacıyla çerezler kullanmaktayız.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">2. Hangi Tür Çerezleri Kullanıyoruz?</h2>
                        <ul className="list-disc pl-5 space-y-4">
                            <li>
                                <strong>Zorunlu Çerezler:</strong> Web sitemizin düzgün çalışması, özelliklerinden faydalanabilmeniz ve yönetim paneli girişlerinizin güvenliği için gerekli olan çerezlerdir.
                            </li>
                            <li>
                                <strong>Performans ve Analiz Çerezleri:</strong> Sitemizi kaç kişinin ziyaret ettiğini, hangi sayfaların daha çok görüntülendiğini anlamamıza yardımcı olan ve sitemizi geliştirmemizi sağlayan çerezlerdir.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">3. Çerezlerin Kullanım Amacı</h2>
                        <p>Sitemizde yer alan çerezler aşağıdaki amaçlar doğrultusunda kullanılmaktadır:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-4">
                            <li>Sitenin çalışması için gerekli temel fonksiyonları gerçekleştirmek.</li>
                            <li>Siteyi analiz etmek ve performansını artırmak.</li>
                            <li>Kullanım kolaylığı sağlamak ve tercihlerinizi hatırlamak.</li>
                            <li>Yönetim paneli güvenliğini sağlamak.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">4. Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
                        <p>
                            Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi kişiselleştirme imkanına sahipsiniz. Çerezleri engellemeniz durumunda web sitemizin bazı özelliklerinin tam olarak çalışmayabileceğini hatırlatmak isteriz.
                        </p>
                        <p className="mt-4">Popüler tarayıcılarda çerez yönetimi için aşağıdaki bağlantıları kullanabilirsiniz:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                            <li>Google Chrome</li>
                            <li>Mozilla Firefox</li>
                            <li>Safari</li>
                            <li>Microsoft Edge</li>
                        </ul>
                    </section>

                    <section className="bg-[#F8F7F5] p-8 rounded-[2rem] border border-stone-100">
                        <p className="text-sm font-light italic mb-2">Sorularınız için bizimle iletişime geçebilirsiniz:</p>
                        <p className="text-sm font-bold text-[#2D2926]">
                            {siteData.contact.email}
                        </p>
                    </section>
                </div>
            </main>

            <Footer data={siteData.footer} brand={siteData.brand} />
        </div>
    );
}
