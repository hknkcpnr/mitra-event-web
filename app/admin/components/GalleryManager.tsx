import React, { useState, useEffect } from 'react';
import { Trash2, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Upload, Plus } from 'lucide-react';

export default function GalleryManager() {
    const [images, setImages] = useState<{ name: string, size: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchImages = async () => {
        setIsLoading(true);
        console.log('Fetching gallery images...');
        try {
            const res = await fetch('/api/gallery');
            const data = await res.json();
            if (res.ok) {
                setImages(data.images || []);
            } else {
                setMessage({ type: 'error', text: data.error || 'Resimler yüklenemedi' });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: 'Bağlantı hatası' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchImages();
    }, []);

    if (!mounted) return null;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const mb = bytes / (k * k);
        if (mb < 1) {
            return (bytes / k).toFixed(1) + ' KB';
        }
        return mb.toFixed(2) + ' MB';
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const MAX_IMAGES = 30;
        if (images.length >= MAX_IMAGES) {
            setMessage({ type: 'error', text: `Maksimum ${MAX_IMAGES} resim sınırına ulaşıldı.` });
            return;
        }

        const file = e.target.files?.[0];
        console.log('handleUpload triggered:', file?.name);
        if (!file) return;

        setMessage(null);

        // Client-side validation
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setMessage({ type: 'error', text: 'Dosya boyutu maksimum 10 MB olabilir.' });
            return;
        }

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const extName = extMatch ? extMatch[0].toLowerCase() : '';
        if (!allowedExtensions.includes(extName)) {
            setMessage({ type: 'error', text: 'Sadece .jpg, .jpeg, .png, .gif, .webp formatları yüklenebilir.' });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Resim başarıyla yüklendi.' });
                // Listeyi yenile
                fetchImages();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Yükleme başarısız' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bağlantı hatası' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (e: React.MouseEvent, filename: string) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('handleDelete triggered for:', filename);
        if (!confirm('Bu resmi silmek istediğinize emin misiniz?')) {
            console.log('Deletion cancelled by user');
            return;
        }

        console.log('User confirmed, executing API call...');
        try {
            const url = `/api/gallery?file=${encodeURIComponent(filename)}`;
            console.log('Request URL:', url);

            const res = await fetch(url, {
                method: 'DELETE',
            });

            console.log('Response Status:', res.status);
            const data = await res.json();
            console.log('Response Data:', data);

            if (res.ok) {
                setImages(prev => prev.filter(img => img.name !== filename));
                setMessage({ type: 'success', text: 'Resim başarıyla silindi' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Silinirken hata oluştu' });
            }
        } catch (error) {
            console.error('Delete Request Error:', error);
            setMessage({ type: 'error', text: 'Bağlantı hatası' });
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-orange-100/50">
                <div>
                    <h2 className="text-3xl font-serif text-[#2D2926] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                            <ImageIcon size={28} />
                        </div>
                        Galeri Yönetimi
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm max-w-md">Sisteme yüklenen tüm resimleri görüntüleyin ve yönetin.</p>
                </div>
                <div className="bg-orange-50/50 px-5 py-3 rounded-2xl border border-orange-100 flex items-center gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Toplam Resim</p>
                        <p className={`text-2xl font-bold ${images.length >= 30 ? 'text-red-500' : 'text-orange-700'}`}>
                            {images.length} <span className="text-sm text-gray-400 font-medium">/ 30</span>
                        </p>
                    </div>
                    <div className="h-10 w-px bg-orange-200"></div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || images.length >= 30}
                        className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-orange-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        {isUploading ? 'Yükleniyor...' : images.length >= 30 ? 'Limit Doldu' : 'Yeni Resim'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>
            </div>

            {message && (
                <div className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                        <ImageIcon size={48} className="mb-4 text-gray-300" />
                        <p>Henüz yüklenmiş resim bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img, idx) => (
                            <div key={idx} className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-square shadow-sm hover:shadow-lg transition-all">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/uploads/${img.name}`}
                                    alt={img.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 bg-gray-50"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                    <p className="text-white text-xs text-center truncate w-full font-medium">{img.name}</p>
                                    <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                                        {formatBytes(img.size)}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, img.name)}
                                        className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto z-10"
                                        title="Resmi Sil"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
