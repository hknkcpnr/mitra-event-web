import React from 'react';
import { Type, Edit3, Search, Image as ImageIcon, Globe, Monitor, User, AlertCircle, Eye } from 'lucide-react';
import { ImageUploadField } from './shared';

export const MetaSettings = ({ content, handleChange }: { content: any, handleChange: (path: any[], value: any) => void }) => {
    const meta = content?.meta || {};

    const metaFields = [
        { key: 'siteTitle', label: 'Site Başlığı (Title)', placeholder: 'Mitra Event | Profesyonel Etkinlik Organizasyonu', icon: <Type size={16} className="text-orange-500" />, description: 'Tarayıcı sekmesinde ve arama sonuçlarında görünen ana başlık.', type: 'text' },
        { key: 'siteDescription', label: 'Site Açıklaması (Description)', placeholder: 'Sitenizin kısa açıklaması...', icon: <Edit3 size={16} className="text-blue-500" />, description: 'Google arama sonuçlarında başlığın altında görünen metin. 150-160 karakter ideal.', type: 'textarea' },
        { key: 'keywords', label: 'Anahtar Kelimeler (Keywords)', placeholder: 'düğün, organizasyon, etkinlik...', icon: <Search size={16} className="text-emerald-500" />, description: 'Virgülle ayrılmış anahtar kelimeler. SEO için önemli.', type: 'text' },
        { key: 'ogImage', label: 'Sosyal Medya Görseli (OG Image)', placeholder: '/uploads/og-image.jpg', icon: <ImageIcon size={16} className="text-purple-500" />, description: 'Sosyal medyada paylaşıldığında görünecek görsel.', type: 'image' },
        { key: 'favicon', label: 'Favicon', placeholder: '/favicon.ico', icon: <Globe size={16} className="text-amber-500" />, description: 'Tarayıcı sekmesindeki küçük ikon.', type: 'text' },
        { key: 'themeColor', label: 'Tema Rengi', placeholder: '#2D2926', icon: <Monitor size={16} className="text-pink-500" />, description: 'Mobil tarayıcılarda üst çubuğun rengi (hex formatında).', type: 'text' },
        { key: 'author', label: 'Yazar / Firma Adı', placeholder: 'Mitra Event', icon: <User size={16} className="text-gray-500" />, description: 'Arama motorlarında yazar olarak görünecek isim.', type: 'text' },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-500 shadow-inner">
                        <Globe size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif text-[#2D2926]">Meta & SEO Ayarları</h2>
                        <p className="text-sm text-gray-400 mt-1">Sitenizin arama motorları ve sosyal medya için görünürlüğünü buradan yönetin.</p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-amber-800">Meta veriler neden önemli?</p>
                    <p className="text-xs text-amber-700/70 mt-1 leading-relaxed">
                        Meta etiketler, sitenizin Google ve diğer arama motorlarında nasıl göründüğünü belirler.
                        Doğru ayarlanmış meta veriler, sitenizin daha fazla ziyaretçi çekmesine yardımcı olur.
                    </p>
                </div>
            </div>

            {/* Fields */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-7">
                {metaFields.map((field) => (
                    <div key={field.key} className="group">
                        <label className="flex items-center gap-2.5 text-sm font-bold text-gray-700 mb-2">
                            {field.icon}
                            {field.label}
                        </label>
                        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{field.description}</p>

                        {field.type === 'textarea' ? (
                            <div>
                                <textarea
                                    value={meta[field.key] || ''}
                                    onChange={(e) => handleChange(['meta', field.key], e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-700 placeholder:text-gray-300"
                                />
                                <div className="flex justify-end mt-1.5">
                                    <span className={`text-[10px] font-bold ${(meta[field.key] || '').length > 160 ? 'text-red-500' : (meta[field.key] || '').length > 120 ? 'text-amber-500' : 'text-gray-300'}`}>
                                        {(meta[field.key] || '').length} / 160 karakter
                                    </span>
                                </div>
                            </div>
                        ) : field.type === 'image' ? (
                            <ImageUploadField
                                value={meta[field.key] || ''}
                                onChange={(newPath) => handleChange(['meta', field.key], newPath)}
                                label={field.label}
                            />
                        ) : (
                            <input
                                type="text"
                                value={meta[field.key] || ''}
                                onChange={(e) => handleChange(['meta', field.key], e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 outline-none transition-all text-gray-700 placeholder:text-gray-300"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Preview */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Eye size={14} />
                    Google Arama Önizlemesi
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[#1a0dab] text-lg font-medium leading-snug hover:underline cursor-pointer truncate">
                        {meta.siteTitle || 'Site Başlığı'}
                    </p>
                    <p className="text-[#006621] text-sm mt-1 truncate">mitraevent.com</p>
                    <p className="text-[#545454] text-sm mt-1 leading-relaxed line-clamp-2">
                        {meta.siteDescription || 'Site açıklaması burada görünecek...'}
                    </p>
                </div>
            </div>
        </div>
    );
};
