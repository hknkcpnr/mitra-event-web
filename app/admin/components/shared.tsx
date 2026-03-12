import React, { useState, useRef, useEffect } from "react";
import { Monitor, Type, Briefcase, Users, Camera, Phone, Mail, Settings, X, Save, Loader2, Upload, ImageIcon, AlertCircle, Layout, Globe, Image as GalleryIcon, Download, Search, LayoutGrid, Check, Trash2 } from "lucide-react";

export const sectionConfig: Record<string, { label: string, icon: React.ReactNode }> = {
    hero: { label: "Banner (Ana Ekran)", icon: <Monitor size={16} /> },
    brand: { label: "Marka Bilgileri", icon: <Globe size={16} /> },
    philosophy: { label: "Felsefe", icon: <Type size={16} /> },
    services: { label: "Hizmetler", icon: <Briefcase size={16} /> },
    testimonials: { label: "Müşteri Yorumları", icon: <Users size={16} /> },
    projects: { label: "Projeler", icon: <Camera size={16} /> },
    gallery: { label: "Galeri", icon: <GalleryIcon size={16} /> },
    contact: { label: "İletişim & KVKK", icon: <Phone size={16} /> },
    footer: { label: "Footer (Alt Bilgi)", icon: <Layout size={16} /> },
    inquiries: { label: "Başvurular", icon: <Mail size={16} /> },
};

export const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    beklemede: { label: 'Beklemede', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
    olumlu: { label: 'Olumlu', color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
    olumsuz: { label: 'Olumsuz', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
    okundu: { label: 'Okundu', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
};

export const InquiryCard = ({ inq, onUpdate, onDelete }: { inq: any, onUpdate: (id: string, s: string, n: string) => Promise<void>, onDelete: (id: string) => void }) => {
    const [localStatus, setLocalStatus] = useState(inq.status || 'beklemede');
    const [localNote, setLocalNote] = useState(inq.note || '');
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const cfg = statusConfig[localStatus] || statusConfig.beklemede;

    const save = async () => {
        setSaving(true);
        await onUpdate(inq.id, localStatus, localNote);
        setSaving(false);
        setExpanded(false);
    };

    return (
        <div className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden`}>
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                {/* Profil Resmi + Bilgi */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F97316] font-bold text-sm flex-shrink-0">
                        {inq.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-[#2D2926] text-sm truncate">{inq.name}</p>
                        <p className="text-xs text-gray-400 truncate">{inq.email}</p>
                        {inq.phone && (
                            <p className="text-xs text-[#F97316] font-medium mt-0.5">{inq.phone}</p>
                        )}
                    </div>
                </div>

                {/* Etkinlik Turu */}
                <span className="inline-flex px-3 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                    {inq.eventType}
                </span>

                {/* Durum Rozeti */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                </span>

                {/* Tarih */}
                <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                </span>

                {/* Islemler */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {localStatus === 'beklemede' && (
                        <button
                            onClick={() => { setLocalStatus('okundu'); onUpdate(inq.id, 'okundu', localNote); }}
                            className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            OKUNDU İŞARETLE
                        </button>
                    )}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#F97316] hover:bg-[#FFF7ED]/30 transition-colors"
                        title="Durum Güncelle"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(inq.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Mesaj */}
            <div className="px-5 pb-5">
                <p className="text-[13px] text-gray-500 italic bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    &ldquo;{inq.message}&rdquo;
                </p>
                {inq.note && localStatus !== 'beklemede' && !expanded && (
                    <p className={`mt-2 text-[12px] px-3 py-2 rounded-lg font-medium ${localStatus === 'olumsuz' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        Not: {inq.note}
                    </p>
                )}
            </div>

            {/* Genisletilmis Durum Panosu */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-5 space-y-4">
                    <div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Durum Seç</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(([key, s]) => (
                                <button
                                    key={key}
                                    onClick={() => setLocalStatus(key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${localStatus === key
                                        ? `${s.bg} ${s.color} shadow-sm scale-105`
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {localStatus === 'olumsuz' && (
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Olumsuz Not (Neden?)</p>
                            <textarea
                                rows={3}
                                value={localNote}
                                onChange={e => setLocalNote(e.target.value)}
                                placeholder="Olumsuz yanıtın nedenini buraya yazın..."
                                className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none resize-none text-gray-700"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setExpanded(false); setLocalStatus(inq.status || 'beklemede'); setLocalNote(inq.note || ''); }}
                            className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2D2926] text-white text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MiniBarChart = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-[3px] h-10">
            {data.map((val, i) => (
                <div
                    key={i}
                    className="rounded-sm transition-all duration-300"
                    style={{
                        width: '6px',
                        height: `${Math.max((val / max) * 100, 8)}%`,
                        backgroundColor: color,
                        opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.6,
                    }}
                />
            ))}
        </div>
    );
};


export const MediaPicker = ({ onSelect, onClose }: { onSelect: (url: string) => void, onClose: () => void }) => {
    const [images, setImages] = useState<{ id: string, name: string, url: string, size: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch('/api/gallery');
                const data = await res.json();
                setImages(data.images || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    const filtered = images.filter(img => img.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <GalleryIcon size={20} className="text-orange-500" />
                            Medya Kütüphanesi
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Yüklü resimlerden birini seçin.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-4 bg-white border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Dosya adıyla ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-orange-500 focus:bg-white outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <Loader2 className="animate-spin text-orange-500" size={32} />
                            <p className="text-sm text-gray-400 font-medium tracking-wide">Dosyalar listeleniyor...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <ImageIcon size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-medium">Resim bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filtered.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(img.url)}
                                    className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[9px] text-white truncate font-medium">{img.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ImageUploadField = ({ value, onChange, label, maxSizeMB = 10, allowedFormats = '.jpg,.jpeg,.png,.gif,.webp' }: { value: string, onChange: (newPath: string) => void, label: string, maxSizeMB?: number, allowedFormats?: string }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    const handleUpload = async (file: File) => {
        setErrorMsg(null);

        const MAX_SIZE = maxSizeMB * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setErrorMsg(`Dosya boyutu maksimum ${maxSizeMB} MB olabilir.`);
            return;
        }

        const allowedExtensions = allowedFormats.split(',').map(ext => ext.trim().toLowerCase());
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const extName = extMatch ? extMatch[0].toLowerCase() : '';
        if (!allowedExtensions.includes(extName)) {
            setErrorMsg(`Sadece ${allowedFormats} formatları yüklenebilir.`);
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Yükleme başarısız');
            onChange(data.path);
        } catch (err: any) {
            console.error('Upload error:', err);
            setErrorMsg(err.message || 'Dosya yüklenirken hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) handleUpload(file);
    };

    return (
        <div className="flex flex-col col-span-full">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 capitalize flex items-center gap-2">
                <Monitor size={14} className="text-gray-400" />
                {label}
            </label>

            {value && (
                <div className="mb-3 relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-gray-800 px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            Değiştir
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex-1 cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all
                        ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'}
                        ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
                >
                    {isUploading ? (
                        <div className="flex items-center justify-center gap-2 py-2">
                            <Loader2 size={18} className="animate-spin text-orange-500" />
                            <span className="text-sm text-gray-500 font-medium">Yükleniyor...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 py-2">
                            <Upload size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-500">Yükle</span>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="flex-shrink-0 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-all flex flex-col items-center justify-center gap-1"
                >
                    <GalleryIcon size={18} />
                    <span className="text-[10px] font-bold">Kütüphane</span>
                </button>
            </div>

            {showPicker && (
                <MediaPicker
                    onSelect={(url) => { onChange(url); setShowPicker(false); }}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {errorMsg && (
                <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                    <AlertCircle size={14} /> {errorMsg}
                </p>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    );
};

export const EVENT_TYPE_STYLE_MAP: Record<string, { bg: string, border: string, text: string, dot: string, hex: string }> = {
    'düğün': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500', hex: '#EC4899' },
    'nişan': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', hex: '#F43F5E' },
    'kına': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', hex: '#EF4444' },
    'doğum günü': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', hex: '#F59E0B' },
    'kurumsal': { bg: 'bg-blue-50', border: 'border-emerald-200', text: 'text-blue-700', dot: 'bg-orange-500', hex: '#3B82F6' },
    'parti': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', hex: '#8B5CF6' },
    'mezuniyet': { bg: 'bg-orange-50', border: 'border-emerald-200', text: 'text-orange-700', dot: 'bg-orange-500', hex: '#F97316' },
    'diğer': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500', hex: '#6B7280' }
};

export const getEventStyle = (type: string) => EVENT_TYPE_STYLE_MAP[type.toLowerCase()] || EVENT_TYPE_STYLE_MAP['diğer'];

export const TR_LABELS: Record<string, string> = {
    // Genel
    title: "Başlık",
    description: "Açıklama",
    email: "E-posta",
    phone: "Telefon",
    address: "Adres",
    socials: "Sosyal Medya",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    bottomText: "Alt Metin (Copyright)",
    bottomSubtitle: "Alt Bilgi (Alt Başlık)",
    mersisNo: "MERSİS Numarası",
    taxNumber: "Vergi Numarası",
    taxOffice: "Vergi Dairesi",

    // Hero Section
    badgeTitle: "Rozet Başlığı",
    titleLine1: "Başlık Satırı 1",
    titleLine2: "Başlık Satırı 2",
    titleLine3: "Başlık Satırı 3",
    primaryButtonText: "Ana Buton Metni",
    secondaryButtonText: "İkincil Buton Metni",
    images: "Resimler",
    floatingBox: "Kayan Kutu",
    tag: "Etiket 1",
    tagLine2: "Etiket 2",
    infoTitle: "Bilgi Başlığı",
    infoSubtitle: "Bilgi Altbaşlığı",

    // Philosophy
    quoteLine1: "Alıntı Satırı 1",
    quoteLine2: "Alıntı Satırı 2",
    bgImage: "Arka Plan Resmi",

    // Services & Testimonials Meta
    badge: "Bölüm Rozeti",
    servicesMeta: "Hizmetler Başlık Bilgisi",
    testimonialsMeta: "Müşteri Yorumları Başlık Bilgisi",
    projectsMeta: "Projeler Başlık Bilgisi",

    // Items
    category: "Kategori",
    desc: "Kısa Açıklama",
    img: "Resim",
    name: "İsim / Başlık",
    role: "Rol / Tarih",
    quote: "Yorum / Alıntı",

    // Contact
    whatsappUrl: "WhatsApp Linki",
    whatsappText: "WhatsApp Buton Yazısı",
    submitButtonText: "Gönder Buton Yazısı",
    eventTypes: "Etkinlik Türleri (Liste)",

    // Brand / Identity
    brand: "Marka Ayarları",
    logo: "Ana Logo",
    logoLight: "Açık Renk Logo",
    siteName: "Site Adı",
    favicon: "Site İkonu (Favicon)",

    // Gallery
    gallery: "Galeri Yönetimi",
    alt: "Resim Açıklaması",

    // Contact & KVKK
    kvkkText: "KVKK Onay Metni",
    kvkkLink: "KVKK Detay Sayfası Linki",
    showKvkk: "KVKK Onayı Gösterilsin mi?",

    // Meta (SEO)
    meta: "SEO Ayarları",
    siteTitle: "Site Başlığı (Title)",
    siteDescription: "Site Açıklaması (Description)",
    keywords: "Anahtar Kelimeler (Keywords)",
    ogImage: "Paylaşım Resmi (OG Image)",
    themeColor: "Tema Rengi",
    author: "Yazar / Firma"
};

export const getLabel = (key: string) => TR_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim();
