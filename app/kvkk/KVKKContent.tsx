'use client';

import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function KVKKContent({ siteData }: { siteData: any }) {

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926] font-sans">
            <NavBar
                whatsappUrl={siteData.contact.whatsappUrl}
                brand={siteData.brand}
            />

            <main className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#A68BA6] block mb-4">Hukuki Bilgilendirme</span>
                    <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-8">
                        Kişisel Verilerin Korunması <br />
                        <span className="italic font-light text-[#A68BA6]">Aydınlatma Metni</span>
                    </h1>
                    <div className="h-px w-24 bg-[#2D2926]/20 mx-auto"></div>
                </div>

                <div className="prose prose-stone max-w-none space-y-12 text-[#6B6661] leading-relaxed">
                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">1. Veri Sorumlusu</h2>
                        <p>
                            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz; veri sorumlusu olarak <strong>{siteData.brand.siteName}</strong> (“Şirket”) tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
                        <p>
                            Toplanan kişisel verileriniz, Şirketimiz tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların iş birimlerimiz tarafından yapılması; ürün ve hizmetlerimizin beğeni, kullanım habitleri ve ihtiyaçlarınıza göre özelleştirilerek sizlere önerilmesi; Şirketimizin ve Şirketimizle iş ilişkisi içerisinde olan kişilerin hukuki ve ticari güvenliğinin temini; Şirketimizin ticari ve iş stratejilerinin belirlenmesi ve uygulanması amaçlarıyla işlenmektedir.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-4">
                            <li>İletişim faaliyetlerinin yürütülmesi</li>
                            <li>Etkinlik ve organizasyon süreçlerinin yönetimi</li>
                            <li>Müşteri memnuniyetine yönelik aktivitelerin planlanması</li>
                            <li>Talep ve şikayetlerin takibi</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">3. İşlenen Kişisel Verilerin Aktarımı</h2>
                        <p>
                            Toplanan kişisel verileriniz; yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda; iş ortaklarımıza, tedarikçilerimize, kanunen yetkili kamu kurumlarına ve özel kişilere KVKK’nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aktarılabilecektir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">4. Kişisel Veri Toplama Yöntemi ve Hukuki Sebebi</h2>
                        <p>
                            Kişisel verileriniz, Şirketimizle iletişime geçmeniz halinde web sitemizdeki iletişim formları, e-posta, telefon veya fiziksel ortamda sunduğunuz belgeler aracılığıyla toplanmaktadır. Söz konusu kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları kapsamında bu Aydınlatma Metni’nde belirtilen amaçlarla da işlenebilmektedir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[#2D2926] mb-4">5. Kişisel Veri Sahibinin Hakları</h2>
                        <p>
                            KVKK’nın 11. maddesi uyarınca, kişisel veri sahibi olarak aşağıdaki haklara sahipsiniz:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-sm">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
                            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
                            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                            <li>KVKK’nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme,</li>
                            <li>Düzeltme, silme ve yok edilme taleplerinizin, kişisel verilerinizin aktarılmış olduğu üçüncü kişilere bildirilmesini isteme,</li>
                            <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
                            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
                        </ul>
                    </section>

                    <section className="bg-[#F8F7F5] p-8 rounded-[2rem] border border-stone-100">
                        <p className="text-sm font-light italic mb-2">Başvurularınız için:</p>
                        <p className="text-sm font-bold text-[#2D2926]">
                            {siteData.contact.email} <br />
                            {siteData.footer.address}
                        </p>
                    </section>
                </div>
            </main>

            <Footer data={siteData.footer} brand={siteData.brand} />
        </div>
    );
}
