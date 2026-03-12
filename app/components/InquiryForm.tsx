"use client";
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface ContactData {
    titleLine1: string;
    titleLine2: string;
    description: string;
    email: string;
    phone: string;
    whatsappUrl: string;
    whatsappText: string;
    submitButtonText: string;
    eventTypes: string[];
    showKvkk?: boolean;
    kvkkText?: string;
    kvkkLink?: string;
}

interface InquiryFormProps {
    data: ContactData;
}

/**
 * Başvuru Formu (İletişim) Bileşeni
 * Ziyaretçilerin isim, e-posta, telefon ve mesaj bilgilerini alarak
 * sisteme yeni bir başvuru/talep (Inquiry) eklemesini sağlar.
 * KVKK onayı ve WhatsApp entegrasyonu içerir.
 */
const InquiryForm: React.FC<InquiryFormProps> = ({ data }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        eventType: data.eventTypes?.[0] || '',
        message: ''
    });
    const [kvkkAccepted, setKvkkAccepted] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [status, setStatus] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (data.showKvkk && !kvkkAccepted) {
            setStatus({ type: 'error', message: 'Lütfen KVKK metnini onaylayın.' });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Başvurunuz başarıyla gönderildi!' });
                setFormData({ name: '', email: '', phone: '', eventType: data.eventTypes?.[0] || '', message: '' });
                setKvkkAccepted(false);
            } else {
                throw new Error('Başvuru gönderilemedi.');
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="iletişim" className="min-h-screen flex flex-col pt-0 pb-24 px-6 bg-[#F8F7F5]">
            <div className="max-w-7xl mx-auto bg-white rounded-[4rem] p-10 md:p-24 shadow-2xl flex flex-col lg:flex-row items-center gap-20">
                <div className="lg:w-1/2">
                    <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
                        {data.titleLine1} <br /> <span className="italic font-light">{data.titleLine2}</span>
                    </h2>
                    <p className="text-[#6B6661] text-lg font-light mb-12">
                        {data.description}
                    </p>
                    <div className="space-y-8">
                        <div className="flex items-center space-x-6 text-[#2D2926]/70">
                            <div className="w-12 h-12 rounded-full bg-[#FDFCFB] flex items-center justify-center border border-stone-100">
                                <Mail size={18} />
                            </div>
                            <span className="text-sm font-semibold tracking-wider uppercase">{data.email}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-[#2D2926]/70">
                            <div className="w-12 h-12 rounded-full bg-[#FDFCFB] flex items-center justify-center border border-stone-100">
                                <Phone size={18} />
                            </div>
                            <span className="text-sm font-semibold tracking-wider uppercase">{data.phone}</span>
                        </div>
                        <div className="pt-4">
                            <a href={data.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-4 bg-[#25D366]/10 text-[#25D366] px-8 py-4 rounded-full hover:bg-[#25D366] hover:text-white transition-all duration-300">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                                </svg>
                                <span className="text-[11px] font-bold tracking-widest uppercase">{data.whatsappText}</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 w-full space-y-10">
                    {status && (
                        <div className={`p-6 rounded-2xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {status.message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold tracking-widest uppercase text-[#A68BA6]">Tam İsim</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-transparent border-b border-[#2D2926]/10 py-3 outline-none focus:border-[#A68BA6] transition-all font-light"
                                    placeholder="Adınız Soyadınız"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold tracking-widest uppercase text-[#A68BA6]">Telefon</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-transparent border-b border-[#2D2926]/10 py-3 outline-none focus:border-[#A68BA6] transition-all font-light"
                                    placeholder="+90 5xx xxx xx xx"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-[#A68BA6]">E-Posta</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-transparent border-b border-[#2D2926]/10 py-3 outline-none focus:border-[#A68BA6] transition-all font-light"
                                placeholder="email@örnek.com"
                            />
                        </div>
                        <div className="space-y-3 group">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-[#A68BA6] group-focus-within:text-[#2D2926] transition-colors">Etkinlik Türü</label>
                            <div className="relative">
                                <select
                                    value={formData.eventType}
                                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                    className="w-full bg-transparent border-b border-[#2D2926]/10 py-3 pl-4 pr-10 outline-none focus:border-[#A68BA6] focus:border-b-2 transition-all appearance-none cursor-pointer font-light text-[17px] text-[#2D2926]"
                                >
                                    {data.eventTypes?.map(type => (
                                        <option key={type} value={type} className="text-[#2D2926] bg-white">{type}</option>
                                    ))}
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D2926]/20 group-hover:text-[#A68BA6] transition-all">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-[#A68BA6]">Mesajınız</label>
                            <textarea
                                rows={2}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-transparent border-b border-[#2D2926]/10 py-3 outline-none focus:border-[#A68BA6] transition-all resize-none font-light"
                                placeholder="Hayallerinizden bahsedin..."
                            />
                        </div>

                        {data.showKvkk && (
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="kvkk"
                                    checked={kvkkAccepted}
                                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-[#2D2926]/20 text-[#2D2926] focus:ring-[#A68BA6] cursor-pointer"
                                />
                                <label htmlFor="kvkk" className="text-xs text-[#6B6661] font-light leading-relaxed cursor-pointer select-none">
                                    {data.kvkkText}{' '}
                                    {data.kvkkLink && (
                                        <a href={data.kvkkLink} target="_blank" rel="noopener noreferrer" className="text-[#2D2926] font-bold underline">
                                            Detayları İncele
                                        </a>
                                    )}
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || (data.showKvkk && !kvkkAccepted)}
                            className="w-full bg-[#2D2926] text-white py-6 rounded-3xl font-bold tracking-[0.4em] uppercase text-[10px] hover:bg-[#4A4541] transition-all shadow-xl shadow-stone-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'GÖNDERİLİYOR...' : (data.submitButtonText || 'BAŞVURUYU GÖNDER')}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default InquiryForm;
