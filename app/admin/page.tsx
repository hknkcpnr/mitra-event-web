"use client";

import React, { useEffect, useState, useRef } from "react";
import { Save, AlertCircle, CheckCircle, Loader2, LayoutDashboard, Type, Image as ImageIcon, Briefcase, Camera, Phone, ChevronDown, ChevronRight, MessageSquare, Edit3, Monitor, BarChart3, Users, Clock, Eye, Search, TrendingUp, TrendingDown, Upload, X, LogOut, Lock, User, Settings, KeyRound, Mail, CalendarDays, Plus, List, PieChart, Globe, Download, Trash2, ShieldCheck, Shield, Menu } from "lucide-react";

// Orijinal sayfa bilesenlerini ice aktar
import HeroSection from '../components/HeroSection';
import PhilosophySection from '../components/PhilosophySection';
import ServicesGrid from '../components/ServicesGrid';
import ProjectsSlider from '../components/ProjectsSlider';
import TestimonialsSlider from '../components/TestimonialsSlider';
import InquiryForm from '../components/InquiryForm';
import Footer from '../components/Footer';
import GallerySection from '../components/GallerySection';
import GalleryManager from './components/GalleryManager';

import { sectionConfig, statusConfig, InquiryCard, MiniBarChart, ImageUploadField, MediaPicker, EVENT_TYPE_STYLE_MAP, getEventStyle, getLabel } from './components/shared';
import { DashboardStats } from './components/DashboardStats';


/**
 * Yönetici Paneli Ana Bileşeni
 * Tüm içerik yönetimi, kullanıcı yönetimi, takvim ve istatistikleri barındırır.
 */
export default function AdminPage() {
    const [content, setContent] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Dizin isimleri eslestirme (URL Hash için Turkce)
    const TR_HASH_MAP: Record<string, string> = {
        'stats': 'ozet',
        'inquiries': 'basvurular',
        'media_library': 'medya',
        'events': 'takvim',
        'kasa': 'kasa',
        'system_users': 'kullanicilar',
        'system_sessions': 'oturumlar',
        'system_meta': 'seo',
        'system_settings': 'ayarlar',
        'hero': 'banner',
        'brand': 'marka',
        'philosophy': 'felsefe',
        'services': 'hizmetler',
        'testimonials': 'yorumlar',
        'projects': 'projeler',
        'gallery': 'galeri',
        'contact': 'iletisim',
        'footer': 'footer'
    };
    const INV_HASH_MAP = Object.fromEntries(Object.entries(TR_HASH_MAP).map(([k, v]) => [v, k]));

    const [activeSection, setActiveSection] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');
            return INV_HASH_MAP[hash] || hash || 'stats';
        }
        return 'stats';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Yan menu durumu
    const [isSectionsOpen, setIsSectionsOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [userSubTab, setUserSubTab] = useState<'users' | 'account'>('users');
    const [showGalleryPicker, setShowGalleryPicker] = useState(false);

    // Kimlik dogrulama durumu
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'editor' | null>(null);
    const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Kimlik dogrulama ayarlari durumu
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sistem yonetim durumu
    const [users, setUsers] = useState<any[]>([]);
    const [sessionLogs, setSessionLogs] = useState<any[]>([]);
    const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'editor' });
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editUserForm, setEditUserForm] = useState({ username: '', password: '', role: 'editor' });
    const [systemMessage, setSystemMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [isInquiriesLoading, setIsInquiriesLoading] = useState(false);
    const [inquirySearch, setInquirySearch] = useState('');
    const [inquiryFilter, setInquiryFilter] = useState('all');
    const [inquiryTypeFilter, setInquiryTypeFilter] = useState<'unread' | 'read'>('unread');

    // Genel Bakis Panosu Durumu
    const [overviewPeriod, setOverviewPeriod] = useState<'aylik' | 'yillik'>('aylik');

    // Etkinlikler (Takvim) durumu
    const [events, setEvents] = useState<any[]>([]);
    const [calendarView, setCalendarView] = useState<'calendar' | 'list' | 'reports'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [editingEvent, setEditingEvent] = useState<any | null>(null);
    const [eventForm, setEventForm] = useState({
        title: '', date: '', description: '',
        eventType: 'düğün',
        firstName: '', lastName: '', phone: '', price: '', deposit: '',
        paymentStatus: 'beklemede', reminderDays: '0'
    });
    const [reportMonth, setReportMonth] = useState(new Date().getMonth());
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [kasaYear, setKasaYear] = useState(new Date().getFullYear());
    const [kasaMonth, setKasaMonth] = useState<number | 'all'>(new Date().getMonth());
    const [kasaEditingId, setKasaEditingId] = useState<string | null>(null);
    const [kasaEditForm, setKasaEditForm] = useState({ price: '', deposit: '', paymentStatus: '' });
    const [kasaDeletingId, setKasaDeletingId] = useState<string | null>(null);
    const [inquiryDeletingId, setInquiryDeletingId] = useState<string | null>(null);

    // URL hash ile aktif bölümü senkronize et
    useEffect(() => {
        if (isAuthenticated && activeSection) {
            const trHash = TR_HASH_MAP[activeSection] || activeSection;
            window.location.hash = trHash;
        } else if (!isAuthChecking && !isAuthenticated) {
            // Giriş ekranındayken URL'i login olarak işaretle
            if (window.location.hash !== '#login') {
                window.location.hash = 'login';
            }
        }
    }, [activeSection, isAuthenticated, isAuthChecking]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const internalKey = INV_HASH_MAP[hash] || hash;
            if (internalKey) setActiveSection(internalKey);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Sayfa yuklendiginde oturumu kontrol et
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth');
                const data = await res.json();
                setIsAuthenticated(data.authenticated);
                if (data.authenticated) {
                    setUserRole(data.role);
                }
            } catch {
                setIsAuthenticated(false);
                setUserRole(null);
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();
    }, []);

    // Kimlik dogrulamasindan sonra icerigi getir
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchData = async () => {
            try {
                const [contentRes, statsRes, usersRes, sessionsRes, inquiriesRes, eventsRes] = await Promise.all([
                    fetch('/api/content'),
                    fetch('/api/stats'),
                    fetch('/api/users'),
                    fetch('/api/sessions'),
                    fetch('/api/inquiries'),
                    fetch('/api/events')
                ]);

                if (!contentRes.ok) throw new Error('İçerik çekilemedi');

                const contentData = await contentRes.json();
                
                // Varsayilan sistem ayarlarini kontrol et
                const defaultSettings = {
                    maxImageSize: '10',
                    sessionLogLimit: '10',
                    maxGalleryImages: '30',
                    allowedImageFormats: '.jpg,.jpeg,.png,.webp,.gif',
                    maintenanceMode: 'false'
                };

                contentData.systemSettings = {
                    ...defaultSettings,
                    ...(contentData.systemSettings || {})
                };
                
                setContent(contentData);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }

                if (sessionsRes.ok) {
                    const sessionsData = await sessionsRes.json();
                    setSessionLogs(sessionsData);
                }

                if (inquiriesRes.ok) {
                    const inquiriesData = await inquiriesRes.json();
                    setInquiries(inquiriesData);
                }

                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    setEvents(eventsData);
                }

                if (contentData && Object.keys(contentData).length > 0) {
                    setActiveSection('stats');
                }
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    /**
     * Kullanıcı girişi işlemini yönetir
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loginUsername, password: loginPassword }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
                setUserRole(data.role);
                setLoginUsername('');
                setLoginPassword('');
            } else {
                setLoginError(data.error || 'Giriş başarısız.');
            }
        } catch {
            setLoginError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    /**
     * Oturumu sonlandırır ve tüm eyaletleri sıfırlar
     */
    const handleLogout = async () => {
        try {
            await fetch('/api/auth', { method: 'DELETE' });
        } catch { /* yoksay */ }
        setIsAuthenticated(false);
        setUserRole(null);
        setContent(null);
        setStats(null);
        setActiveSection(null);
        setIsLoading(true);
    };

    /**
     * Aktif kullanıcının bilgilerini (kullanıcı adı/şifre) günceller
     */
    const handleUpdateAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setApiMessage(null);

        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newUsername, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setApiMessage({ type: 'success', text: data.message });
                setCurrentPassword('');
                setNewUsername('');
                setNewPassword('');
            } else {
                setApiMessage({ type: 'error', text: data.error || 'Güncelleme başarısız.' });
            }
        } catch {
            setApiMessage({ type: 'error', text: 'Bağlantı hatası.' });
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Yapılan tüm içerik değişikliklerini veritabanına kaydeder
     */
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Tüm değişiklikler başarıyla kaydedildi!' });
                setIsDirty(false);
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bağlantı hatası.' });
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Yeni bir sistem kullanıcısı oluşturur (Sadece Admin)
     */
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSystemMessage(null);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserForm)
            });
            const data = await res.json();
            if (res.ok) {
                setUsers([...users, data.user]);
                setNewUserForm({ username: '', password: '', role: 'editor' });
                setSystemMessage({ type: 'success', text: 'Kullanıcı başarıyla oluşturuldu.' });
            } else {
                setSystemMessage({ type: 'error', text: data.error || 'Hata oluştu' });
            }
        } catch {
            setSystemMessage({ type: 'error', text: 'Bağlantı hatası' });
        }
    };

    /**
     * Mevcut bir sistem kullanıcısını siler
     */
    const handleDeleteUser = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        setSystemMessage(null);
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                setSystemMessage({ type: 'success', text: 'Kullanıcı başarıyla silindi.' });
            } else {
                const data = await res.json();
                setSystemMessage({ type: 'error', text: data.error || 'Silinirken hata oluştu' });
            }
        } catch {
            setSystemMessage({ type: 'error', text: 'Bağlantı hatası' });
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setSystemMessage(null);
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    username: editUserForm.username,
                    password: editUserForm.password || undefined,
                    role: editUserForm.role
                })
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(users.map(u => u.id === editingUser.id ? data.user : u));
                setEditingUser(null);
                setSystemMessage({ type: 'success', text: 'Kullanıcı bilgileri güncellendi.' });
            } else {
                setSystemMessage({ type: 'error', text: data.error || 'Güncelleme hatası' });
            }
        } catch {
            setSystemMessage({ type: 'error', text: 'Bağlantı hatası' });
        }
    };
    
    /**
     * Günlük ziyaretçi istatistiklerini sıfırlar
     */
    const handleResetStats = async () => {
        if (!confirm('Bugünkü ziyaretçi ve sayfa görüntüleme sayılarını sıfırlamak istediğinize emin misiniz?')) return;
        
        try {
            const res = await fetch('/api/stats', { method: 'DELETE' });
            const data = await res.json();
            
            if (res.ok) {
                // Yerel stats durumunu güncelle (bugünü sıfırla)
                if (stats && stats.daily) {
                    const today = new Date().toISOString().split('T')[0];
                    const newStats = JSON.parse(JSON.stringify(stats));
                    const todayRecord = newStats.daily.find((d: any) => d.date === today);
                    if (todayRecord) {
                        todayRecord.visitors = 0;
                        todayRecord.pageViews = 0;
                        setStats(newStats);
                    }
                }
                setMessage({ type: 'success', text: 'Günlük istatistikler sıfırlandı.' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Sıfırlama hatası.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Bağlantı hatası.' });
        }
    };

    /**
     * İçerik objesi içindeki belirli bir yolu (path) günceller
     * Eksik ara objeleri otomatik oluşturur.
     */
    const handleChange = (path: (string | number)[], value: any) => {
        setContent((prevContent: any) => {
            const newContent = JSON.parse(JSON.stringify(prevContent));
            let current = newContent;
            for (let i = 0; i < path.length - 1; i++) {
                if (current[path[i]] === undefined || current[path[i]] === null) {
                    current[path[i]] = {};
                }
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            setIsDirty(true);
            return newContent;
        });
    };

    /**
     * İçerik içindeki bir diziye (array) yeni bir eleman ekler
     */
    const handleAddItem = (path: (string | number)[], defaultValue: any) => {
        setContent((prevContent: any) => {
            const newContent = JSON.parse(JSON.stringify(prevContent));
            let current = newContent;
            for (let i = 0; i < path.length; i++) {
                current = current[path[i]];
            }
            if (Array.isArray(current)) {
                current.push(defaultValue);
                setIsDirty(true);
            }
            return newContent;
        });
    };

    /**
     * İçerik içindeki bir diziden belirtilen indisteki elemanı siler
     */
    const handleRemoveItem = (path: (string | number)[], index: number) => {
        setContent((prevContent: any) => {
            const newContent = JSON.parse(JSON.stringify(prevContent));
            let current = newContent;
            for (let i = 0; i < path.length; i++) {
                current = current[path[i]];
            }
            if (Array.isArray(current)) {
                current.splice(index, 1);
                setIsDirty(true);
            }
            return newContent;
        });
    };

    /**
     * Bir anahtarin resim alani olup olmadigini kontrol eder
     */
    const isImageField = (key: string, value: any): boolean => {
        if (typeof value !== 'string') return false;
        const lowerKey = key.toLowerCase();
        // WhatsApp URL leri "url" kelimesini icerse bile resim olarak degerlendirilmemeli
        if (lowerKey.includes('whatsapp')) return false;

        const imageKeys = ['img', 'url', 'image', 'photo', 'src', 'thumbnail', 'cover', 'avatar', 'banner', 'logo'];
        return imageKeys.some(ik => lowerKey.includes(ik));
    };

    /**
     * Ozyinelemeli (Recursive) form olusturucu
     */
    /**
     * Verilen veri objesini özyinelemeli olarak form alanlarına dönüştürür
     */
    const renderFields = (data: any, path: (string | number)[] = []): React.ReactElement[] => {
        return Object.keys(data).map((key) => {
            const value = data[key];
            const currentPath = [...path, key];
            const isArray = Array.isArray(value);
            const isObject = typeof value === 'object' && value !== null && !isArray;

            if (isObject) {
                const isNumericKey = /^\d+$/.test(key);
                return (
                    <div key={currentPath.join('.')} className={`col-span-full ${isNumericKey ? '' : 'border-l-4 border-orange-100 pl-4 py-2 mt-4'}`}>
                        {key && !isNumericKey && (
                            <h3 className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-widest">
                                {getLabel(key)}
                            </h3>
                        )}
                        <div className="grid grid-cols-1 gap-4">
                            {renderFields(value, currentPath)}
                        </div>
                    </div>
                );
            }

            if (isArray) {
                const isSimpleStringArray = value.length > 0 ? typeof value[0] === 'string' : true;

                if (isSimpleStringArray) {
                    return (
                        <div key={currentPath.join('.')} className="col-span-full mt-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-sm font-bold mb-4 text-[#2D2926] uppercase tracking-widest flex items-center gap-2">
                                <List size={16} className="text-orange-500" />
                                {getLabel(key)}
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {value.map((item: string, index: number) => (
                                    <div
                                        key={index}
                                        className="group flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm hover:border-orange-200 transition-all"
                                    >
                                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                                        <button
                                            onClick={() => handleRemoveItem(currentPath, index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {value.length === 0 && (
                                    <p className="text-xs text-gray-400 italic py-2 px-1">Henüz eleman eklenmemiş.</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Yeni eklemek için yazın..."
                                    className="flex-1 p-2.5 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm bg-white shadow-inner"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                handleAddItem(currentPath, val);
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                        const val = input.value.trim();
                                        if (val) {
                                            handleAddItem(currentPath, val);
                                            input.value = "";
                                        }
                                    }}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm"
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                    );
                }

                const isComplexArray = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && (value[0].img || value[0].image || value[0].name || value[0].title);
                const pathKey = currentPath.join('.');
                const activeIndex = activeTabs[pathKey] || 0;

                return (
                    <div key={pathKey} className="col-span-full mt-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full shadow-sm"></div>
                                <div>
                                    <h3 className="text-sm font-black text-[#2D2926] uppercase tracking-[0.1em]">
                                        {getLabel(key)} Yönetimi
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    value={activeIndex}
                                    onChange={(e) => setActiveTabs(prev => ({ ...prev, [pathKey]: Number(e.target.value) }))}
                                    className="bg-gray-50 border border-gray-200 text-xs font-black text-gray-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer min-w-[200px] shadow-sm"
                                >
                                    {value.map((item: any, idx: number) => (
                                        <option key={idx} value={idx}>
                                            {idx + 1}. {item.title || item.name || 'İsimsiz Kayıt'}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => {
                                        const newItem = typeof value[0] === 'object' ? JSON.parse(JSON.stringify(value[0])) : "";
                                        handleAddItem(currentPath, newItem);
                                        setActiveTabs(prev => ({ ...prev, [pathKey]: value.length }));
                                    }}
                                    className="h-10 px-4 rounded-xl flex items-center gap-2 bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap"
                                >
                                    <Plus size={16} /> Yeni Ekle
                                </button>
                            </div>
                        </div>

                        {value.length > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative bg-gray-50/30 p-6 rounded-2xl border border-gray-100/50">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-orange-100">
                                        Düzenlenen Kayıt: {activeIndex + 1} / {value.length}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                                                handleRemoveItem(currentPath, activeIndex);
                                                setActiveTabs(prev => ({ ...prev, [pathKey]: Math.max(0, activeIndex - 1) }));
                                            }
                                        }}
                                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider p-1.5"
                                    >
                                        <X size={12} /> Bu Kaydı Sil
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {renderFields(value[activeIndex], [...currentPath, activeIndex])}
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-100 rounded-3xl py-12 flex flex-col items-center justify-center text-gray-300">
                                <p className="text-xs font-bold uppercase tracking-widest">Kayıt Bulunmuyor</p>
                            </div>
                        )}
                    </div>
                );
            }

            const isTextarea = typeof value === 'string' && value.length > 50;

            if (key === 'id') {
                return (
                    <div key={currentPath.join('.')} className="flex flex-col col-span-1 opacity-60 pointer-events-none hidden">
                        <label className="text-xs font-medium text-gray-500 mb-1 capitalize flex items-center gap-1">{key} (Yalnızca Okunur) <LayoutDashboard size={10} /></label>
                        <input type="text" value={value} readOnly className="p-2.5 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-500" />
                    </div>
                );
            }

            // Resim alanlari icin resim yukleme kullan
            if (isImageField(key, value)) {
                return (
                    <ImageUploadField
                        key={currentPath.join('.')}
                        value={value}
                        onChange={(newPath) => handleChange(currentPath, newPath)}
                        label={getLabel(key)}
                        maxSizeMB={parseInt(content?.systemSettings?.maxImageSize || '10')}
                        allowedFormats={content?.systemSettings?.allowedImageFormats || '.jpg,.jpeg,.png,.webp'}
                    />
                );
            }

            return (
                <div key={currentPath.join('.')} className="flex flex-col col-span-full">
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 capitalize flex items-center gap-2">
                        {getLabel(key)}
                    </label>
                    {isTextarea ? (
                        <textarea
                            value={value}
                            onChange={(e) => handleChange(currentPath, e.target.value)}
                            rows={3}
                            className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-y text-sm w-full bg-white"
                            placeholder="Değer giriniz..."
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(currentPath, e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm bg-white"
                            placeholder="Değer giriniz..."
                        />
                    )}
                </div>
            );
        });
    };



    /**
     * Etkinlikleri Olustur (Takvim ve Liste)
     */
    /**
     * Organizasyon yönetimi sayfasını (Takvim ve Liste) oluşturur
     */
    const renderEvents = () => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 is Sunday

        // Pazartesi baslangici icin ayarla:
        const firstDayIndex = startDay === 0 ? 6 : startDay - 1;
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

        const handleSaveEvent = async (e: React.FormEvent) => {
            e.preventDefault();
            setSystemMessage(null);
            try {
                const method = editingEvent ? 'PATCH' : 'POST';
                const payload = editingEvent ? { ...eventForm, id: editingEvent.id } : eventForm;

                const res = await fetch('/api/events', {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok) {
                    if (editingEvent) {
                        setEvents(events.map(ev => ev.id === editingEvent.id ? data.event : ev));
                    } else {
                        setEvents([...events, data.event]);
                    }
                    setIsEventModalOpen(false);
                    setSystemMessage({ type: 'success', text: 'Organizasyon başarıyla kaydedildi.' });
                    setTimeout(() => setSystemMessage(null), 3000);
                } else {
                    setSystemMessage({ type: 'error', text: data.error || 'Hata oluştu' });
                }
            } catch {
                setSystemMessage({ type: 'error', text: 'Bağlantı hatası' });
            }
        };

        const deleteEvent = async (id: string) => {
            if (!confirm('Bu organizasyonu silmek istediğinize emin misiniz?')) return;
            try {
                const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setEvents(events.filter(e => e.id !== id));
                    setSystemMessage({ type: 'success', text: 'Silindi.' });
                    setIsEventModalOpen(false);
                }
            } catch {
                setSystemMessage({ type: 'error', text: 'Silinemedi.' });
            }
        };

        const downloadEventsExcel = () => {
            const headers = ["ID", "Etkinlik", "Tür", "Tarih", "Müşteri Adı", "Müşteri Soyadı", "Telefon", "Fiyat", "Ödeme Durumu", "Oluşturulma Tarihi"];
            const rows = events.map(ev => [
                ev.id,
                ev.title || '',
                ev.eventType || 'Diğer',
                ev.date ? new Date(ev.date).toLocaleDateString('tr-TR') : '',
                ev.firstName || '',
                ev.lastName || '',
                ev.phone || '',
                ev.price || 0,
                ev.paymentStatus === 'alindi' ? 'Tamamı Alındı' : ev.paymentStatus === 'isimolasi' ? 'Kapora İçerir' : 'Beklemede',
                ev.createdAt ? new Date(ev.createdAt).toLocaleDateString('tr-TR') : ''
            ]);

            const escapeCSV = (value: any) => {
                const str = String(value ?? '');
                if (str.includes(';') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            const csvDataRows = [headers, ...rows].map(e => e.map(escapeCSV).join(";")).join("\n");
            const csvContent = "sep=;\n" + csvDataRows;

            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `mitra_event_listesi_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="w-full max-w-6xl mx-auto space-y-6 mt-6">

                {/* Unified Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-500 flex-shrink-0">
                            <CalendarDays size={20} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {calendarView === 'calendar' ? `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}` : 'Takvim ve Organizasyonlar'}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                            <button
                                onClick={() => setCalendarView('calendar')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${calendarView === 'calendar' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                            >
                                <CalendarDays size={16} className="hidden sm:block" /> Takvim
                            </button>
                            <button
                                onClick={() => setCalendarView('list')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${calendarView === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                            >
                                <List size={16} className="hidden sm:block" /> Liste
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-0.5"></div>
                            <button
                                onClick={() => setCalendarView('reports')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${calendarView === 'reports' ? 'bg-orange-600 shadow-md text-white' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50/50'}`}
                            >
                                <PieChart size={16} className="hidden sm:block" /> Raporlar
                            </button>
                        </div>

                        {calendarView === 'list' && (
                            <button
                                onClick={downloadEventsExcel}
                                className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Download size={14} /> EXCEL ÇIKTISI AL
                            </button>
                        )}

                        {calendarView === 'calendar' && (
                            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                <button
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                                >
                                    <ChevronDown className="rotate-90" size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(new Date())}
                                    className="px-5 py-2 rounded-lg bg-orange-50 text-orange-600 font-bold text-[11px] uppercase tracking-wider hover:bg-orange-100 transition-colors"
                                >
                                    Bugün
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                                >
                                    <ChevronDown className="-rotate-90" size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {systemMessage && (
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-4 ${systemMessage.type === 'success' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
                        {systemMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {systemMessage.text}
                    </div>
                )}

                {calendarView === 'calendar' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        <div className="p-4 bg-gray-50/50">
                            <div className="grid grid-cols-7 gap-3">
                                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                                    <div key={day} className="py-2.5 text-center text-[11px] font-black text-gray-500 uppercase tracking-widest bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                                        {day}
                                    </div>
                                ))}

                                {/* Boşluklar (Önceki aydan kalan günler) */}
                                {Array.from({ length: firstDayIndex }).map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-transparent h-24 lg:h-28 xl:h-[110px] p-2 opacity-20 select-none"></div>
                                ))}

                                {/* Günler */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                    const dayEvents = events.filter(e => e.date === dateStr);

                                    return (
                                        <div
                                            key={day}
                                            onClick={() => {
                                                setSelectedDate(new Date(dateStr));
                                                setEditingEvent(null);
                                                setEventForm({
                                                    title: '', date: dateStr, description: '',
                                                    eventType: content?.contact?.eventTypes?.[0]?.toLowerCase() || 'düğün',
                                                    firstName: '', lastName: '', phone: '', price: '', deposit: '',
                                                    paymentStatus: 'beklemede', reminderDays: '0'
                                                });
                                                setIsEventModalOpen(true);
                                            }}
                                            className={`group relative h-24 lg:h-28 xl:h-[110px] p-2 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm flex flex-col ${isToday ? 'bg-orange-50/30 border-2 border-orange-500 ring-4 ring-orange-100 z-10' : dayEvents.length > 0 ? 'bg-white border border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 z-0 hover:z-10' : 'bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 z-0 hover:z-10'}`}
                                        >
                                            <div className="flex items-start justify-between mb-1.5">
                                                <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-black transition-colors ${isToday ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/40' : dayEvents.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
                                                    {day}
                                                </span>
                                                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-orange-600 p-1 bg-gray-50 hover:bg-orange-100 rounded-lg transition-all transform scale-90 group-hover:scale-100">
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <div className="flex-1 flex flex-col gap-1 overflow-hidden pr-1 -mr-1">
                                                {dayEvents.slice(0, 2).map(ev => {
                                                    const style = getEventStyle(ev.eventType || 'diğer');

                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingEvent(ev);
                                                                setEventForm({ ...ev, reminderDays: ev.reminderDays.toString() });
                                                                setIsEventModalOpen(true);
                                                            }}
                                                            className={`relative group/event px-2 py-1.5 ${style.bg} ${style.border} border rounded-lg text-xs shadow-sm shadow-[${style.hex}20] hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] duration-200`}
                                                        >
                                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                                <span className={`truncate font-bold ${style.text}`}>{ev.title || 'İsimsiz'}</span>
                                                                {ev.paymentStatus === 'alindi' && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" title="Ödeme Alındı" />
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between items-center opacity-90">
                                                                <span className={`text-[8px] font-black uppercase tracking-widest ${style.text} bg-white/60 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/40`}>
                                                                    {ev.eventType}
                                                                </span>
                                                                <span className={`font-bold text-[9px] ${style.text} bg-white/40 px-1 rounded-md`}>
                                                                    {ev.firstName}
                                                                </span>
                                                            </div>
                                                            {ev.price && (
                                                                <div className="mt-1 flex justify-between items-center text-[8px] font-bold opacity-80">
                                                                    <span className={style.text}>Kalan:</span>
                                                                    <span className={style.text}>
                                                                        {Number(ev.price) - Number(ev.deposit || 0)} ₺
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-[10px] text-gray-500 font-bold text-center mt-0.5 bg-gray-50/80 rounded-lg py-0.5 border border-gray-100/50">
                                                        +{dayEvents.length - 2} etkinlik daha
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {calendarView === 'list' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4">Organizasyon</th>
                                    <th className="px-6 py-4">Tür</th>
                                    <th className="px-6 py-4">Müşteri</th>
                                    <th className="px-6 py-4">İletişim</th>
                                    <th className="px-6 py-4 text-right">Fiyat</th>
                                    <th className="px-6 py-4 text-right">Kalan</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ev => (
                                    <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {new Date(ev.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-[#2D2926] font-medium">{ev.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getEventStyle(ev.eventType || 'diğer').bg} ${getEventStyle(ev.eventType || 'diğer').text} border ${getEventStyle(ev.eventType || 'diğer').border}`}>
                                                {ev.eventType || 'diğer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#2D2926]">{ev.firstName} {ev.lastName}</td>
                                        <td className="px-6 py-4">{ev.phone}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-500">{Number(ev.price || 0).toLocaleString('tr-TR')} ₺</td>
                                        <td className="px-6 py-4 text-right font-bold text-orange-600">
                                            {(ev.paymentStatus === 'alindi' ? 0 : (Number(ev.price || 0) - Number(ev.deposit || 0))).toLocaleString('tr-TR')} ₺
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ev.paymentStatus === 'alindi' ? 'bg-green-100 text-green-700' :
                                                ev.paymentStatus === 'isimolasi' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {ev.paymentStatus === 'alindi' ? 'Alındı' : ev.paymentStatus === 'isimolasi' ? 'Kapora İçerir' : 'Beklemede'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setEditingEvent(ev);
                                                    setEventForm({ ...ev, reminderDays: ev.reminderDays.toString() });
                                                    setIsEventModalOpen(true);
                                                }}
                                                className="text-orange-500 hover:text-blue-700 p-2"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Kayıtlı etkinlik bulunamadı.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {calendarView === 'reports' && (
                    <div className="space-y-6">
                        {/* Reports Header / Filters */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <PieChart className="text-orange-500" size={20} />
                                Performans Raporları
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                                    <select
                                        value={reportMonth}
                                        onChange={(e) => setReportMonth(Number(e.target.value))}
                                        className="px-3 py-1.5 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                                    >
                                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                    <div className="w-px bg-gray-200 my-1 mx-1"></div>
                                    <select
                                        value={reportYear}
                                        onChange={(e) => setReportYear(Number(e.target.value))}
                                        className="px-3 py-1.5 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                                    >
                                        {[...Array(5)].map((_, i) => {
                                            const y = new Date().getFullYear() - 2 + i;
                                            return <option key={y} value={y}>{y}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Monthly Report Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-indigo-100 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50 transition-transform group-hover:scale-110"></div>
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CalendarDays size={14} className="text-indigo-400" /> Ayın Özeti ({monthNames[reportMonth]})
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {events.filter(e => {
                                                const d = new Date(e.date);
                                                return d.getMonth() === reportMonth && d.getFullYear() === reportYear;
                                            }).length}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Toplam İş</p>
                                    </div>
                                    <div className="border-l border-gray-100 pl-4">
                                        <p className="text-3xl font-bold text-green-600">
                                            {events.filter(e => {
                                                const d = new Date(e.date);
                                                return d.getMonth() === reportMonth && d.getFullYear() === reportYear && e.paymentStatus === 'alindi';
                                            }).length}
                                        </p>
                                        <p className="text-[10px] font-bold text-green-700/70 uppercase mt-1 inline-flex items-center gap-1"><CheckCircle size={10} /> Tamamlanan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Yearly Report Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:border-orange-100 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50 transition-transform group-hover:scale-110"></div>
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BarChart3 size={14} className="text-blue-400" /> Yılın Özeti ({reportYear})
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {events.filter(e => new Date(e.date).getFullYear() === reportYear).length}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Toplam İş</p>
                                    </div>
                                    <div className="border-l border-gray-100 pl-4">
                                        <p className="text-3xl font-bold text-green-600">
                                            {events.filter(e => new Date(e.date).getFullYear() === reportYear && e.paymentStatus === 'alindi').length}
                                        </p>
                                        <p className="text-[10px] font-bold text-green-700/70 uppercase mt-1 inline-flex items-center gap-1"><CheckCircle size={10} /> Tamamlanan</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">İş Türü Dağılımı ({reportYear})</h3>

                            {(() => {
                                const yearEvents = events.filter(e => new Date(e.date).getFullYear() === reportYear);
                                const counts = yearEvents.reduce((acc: any, ev: any) => {
                                    const type = (ev.eventType || 'diğer').toLowerCase();
                                    acc[type] = (acc[type] || 0) + 1;
                                    return acc;
                                }, {});
                                const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);

                                return sorted.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="w-full h-3 rounded-full flex overflow-hidden bg-gray-100">
                                            {sorted.map(([cat, count]: any) => {
                                                const style = getEventStyle(cat);
                                                return <div key={cat} style={{ width: `${(count / yearEvents.length) * 100}%`, backgroundColor: style.hex }} />
                                            })}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {sorted.map(([cat, count]: any) => {
                                                const style = getEventStyle(cat);
                                                return (
                                                    <div key={cat} className="flex flex-col p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{cat}</span>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <span className="text-xl font-bold text-gray-900">{count}</span>
                                                            <span className="text-[10px] text-gray-400">%{((count / yearEvents.length) * 100).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : <p className="text-center py-4 text-gray-400 text-sm">Veri bulunamadı.</p>
                            })()}
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ödeme Durumu Dağılımı ({reportYear})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Bekleyen */}
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Bekleyen (Sıfır Ödeme)</p>
                                        <p className="text-xl font-bold text-gray-700">{events.filter(e => new Date(e.date).getFullYear() === reportYear && (!e.paymentStatus || e.paymentStatus === 'beklemede')).length}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center text-gray-500"><Clock size={16} /></div>
                                </div>
                                {/* Kapora */}
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Kapora Alındı</p>
                                        <p className="text-xl font-bold text-amber-700">{events.filter(e => new Date(e.date).getFullYear() === reportYear && e.paymentStatus === 'isimolasi').length}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center text-amber-600"><AlertCircle size={16} /></div>
                                </div>
                                {/* Tamamlanan */}
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Tamamı Alındı</p>
                                        <p className="text-xl font-bold text-green-700">{events.filter(e => new Date(e.date).getFullYear() === reportYear && e.paymentStatus === 'alindi').length}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-green-200/50 flex items-center justify-center text-green-600"><CheckCircle size={16} /></div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Event Modal */}
                {isEventModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">

                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CalendarDays className="text-orange-500" size={20} />
                                    {editingEvent ? 'Organizasyonu Düzenle' : 'Yeni Organizasyon Ekle'}
                                </h3>
                                <button onClick={() => setIsEventModalOpen(false)} className="text-gray-400 hover:text-orange-600 bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-minimal">
                                <form id="event-form" onSubmit={handleSaveEvent} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-full md:col-span-1">
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Organizasyon Adı (Kısa Başlık)</label>
                                            <input type="text" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Örn: Ayşe'nin Nişan Töreni" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none focus:bg-white transition-all font-medium" />
                                        </div>

                                        <div className="col-span-full md:col-span-1">
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">İş Türü</label>
                                            <select required value={eventForm.eventType} onChange={e => setEventForm({ ...eventForm, eventType: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none focus:bg-white transition-all font-medium cursor-pointer text-gray-700 capitalize">
                                                {(content?.contact?.eventTypes || []).map((type: string) => (
                                                    <option key={type} value={type.toLowerCase()} className="capitalize">{type}</option>
                                                ))}
                                                <option value="diğer">Diğer</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Tarih</label>
                                            <input type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none focus:bg-white transition-all font-medium" />
                                        </div>

                                        <div className="col-span-1 border-t border-gray-100 md:border-none pt-4 md:pt-0">
                                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">Hatırlatma (Gün kala bildir)</label>
                                            <div className="relative">
                                                <input type="number" min="0" value={eventForm.reminderDays} onChange={e => setEventForm({ ...eventForm, reminderDays: e.target.value })} className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none focus:bg-white transition-all font-medium" />
                                                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            </div>
                                        </div>

                                        <div className="col-span-full border-t border-gray-100 pt-6 mt-2">
                                            <h4 className="text-sm font-bold text-gray-800 mb-4">Müşteri Bilgileri</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Ad</label>
                                                    <input type="text" required value={eventForm.firstName} onChange={e => setEventForm({ ...eventForm, firstName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-orange-500 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Soyad</label>
                                                    <input type="text" required value={eventForm.lastName} onChange={e => setEventForm({ ...eventForm, lastName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-orange-500 outline-none" />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Telefon Numarası</label>
                                                    <input type="tel" required value={eventForm.phone} onChange={e => setEventForm({ ...eventForm, phone: e.target.value })} placeholder="+90 5XX XXX XX XX" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-orange-500 outline-none" />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Toplam Ücret (₺)</label>
                                                    <input type="number" min="0" required value={eventForm.price} onChange={e => setEventForm({ ...eventForm, price: e.target.value })} placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-orange-500 outline-none" />
                                                </div>
                                                {eventForm.paymentStatus === 'isimolasi' && (
                                                    <div className="col-span-1 animate-in slide-in-from-left-2 duration-300">
                                                        <label className="block text-[11px] font-bold text-amber-600 mb-2 uppercase tracking-wider">Alınan Kapora (₺)</label>
                                                        <input type="number" min="0" value={eventForm.deposit} onChange={e => setEventForm({ ...eventForm, deposit: e.target.value })} placeholder="Alınan miktar..." className="w-full px-4 py-3 border border-amber-200 bg-amber-50 rounded-lg text-sm focus:border-amber-500 outline-none" />
                                                    </div>
                                                )}
                                                <div className="col-span-full pt-2">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kalan Ödeme</div>
                                                        <div className="text-xl font-black text-[#2D2926]">
                                                            {(eventForm.paymentStatus === 'alindi' ? 0 : (Number(eventForm.price || 0) - Number(eventForm.deposit || 0))).toLocaleString('tr-TR')} ₺
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-full border-t border-gray-100 pt-6 mt-2">
                                            <h4 className="text-sm font-bold text-gray-800 mb-4">Detaylar ve Ödeme</h4>

                                            <div className="mb-4">
                                                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Ödeme Durumu</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { val: 'beklemede', label: 'Beklemede', color: 'pewter' },
                                                        { val: 'isimolasi', label: 'Kapora Alındı', color: 'amber' },
                                                        { val: 'alindi', label: 'Tamamı Alındı', color: 'green' }
                                                    ].map(o => (
                                                        <label key={o.val} className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all ${eventForm.paymentStatus === o.val ? 'border-orange-500 bg-indigo-50 shadow-sm ring-1 ring-orange-500' : 'border-gray-200 hover:border-indigo-300'}`}>
                                                            <input type="radio" name="paymentStatus" value={o.val} checked={eventForm.paymentStatus === o.val} onChange={e => setEventForm({ ...eventForm, paymentStatus: e.target.value })} className="sr-only" />
                                                            <span className="text-xs font-bold text-gray-700">{o.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Organizasyon Detayları / Notlar</label>
                                                <textarea rows={3} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Süslemeler, ek istekler vb." className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-orange-500 outline-none resize-none" />
                                            </div>
                                        </div>

                                    </div>

                                </form>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2 order-2 sm:order-1 select-none">
                                    <ChevronDown size={14} className="animate-bounce text-indigo-400" />
                                    <span>Seçenekler İçin Aşağı Kaydırın</span>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4 order-1 sm:order-2">
                                    {editingEvent ? (
                                        <button onClick={() => deleteEvent(editingEvent.id)} type="button" className="text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                            Sil
                                        </button>
                                    ) : <div />}
                                    <div className="flex gap-3 text-sm font-bold ml-auto">
                                        <button onClick={() => setIsEventModalOpen(false)} type="button" className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">İptal</button>
                                        <button type="submit" form="event-form" className="px-6 py-2.5 bg-orange-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors">Kaydet</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders User Management
     */
    /**
     * Renders Kasa (Cashbox) section
     */
    const handleDeleteKasaEvent = async (id: string) => {
        try {
            const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEvents(prev => prev.filter(e => e.id !== id));
                setKasaDeletingId(null);
                setMessage({ type: 'success', text: 'Organizasyon başarıyla silindi.' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Silme işlemi başarısız oldu.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Bağlantı hatası. Silinemedi.' });
        }
    };

    const handleOpenKasaEdit = (ev: any) => {
        setKasaEditingId(ev.id);
        setKasaEditForm({
            price: ev.price || '',
            deposit: ev.deposit || '',
            paymentStatus: ev.paymentStatus || 'beklemede',
        });
    };

    const handleSaveKasaEdit = async () => {
        if (!kasaEditingId) return;
        try {
            const res = await fetch('/api/events', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: kasaEditingId,
                    price: kasaEditForm.price,
                    deposit: kasaEditForm.deposit,
                    paymentStatus: kasaEditForm.paymentStatus,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setEvents(prev => prev.map(e => e.id === kasaEditingId ? data.event : e));
                setKasaEditingId(null);
                setMessage({ type: 'success', text: 'Ödeme bilgileri güncellendi.' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Güncelleme başarısız oldu.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Bağlantı hatası.' });
        }
    };

    const renderKasa = () => {
        const parsePrice = (val: any) => {
            if (!val) return 0;
            if (typeof val === 'number') return val;
            const cleaned = val.toString().replace(/\./g, '').replace(/,/g, '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        };

        const isAdmin = userRole === 'admin';

        const filteredKasa = events.filter(ev => {
            if (!ev.date) return false;
            const d = new Date(ev.date);
            if (isNaN(d.getTime())) return false;
            const matchesYear = d.getFullYear() === kasaYear;
            const matchesMonth = kasaMonth === 'all' || d.getMonth() === kasaMonth;
            return matchesYear && matchesMonth;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const totalEarned = filteredKasa.reduce((acc, ev) => {
            const p = parsePrice(ev.price);
            const d = parsePrice(ev.deposit);
            const isPaid = ev.paymentStatus === 'alindi';
            return acc + d + (isPaid ? (p - d) : 0);
        }, 0);

        const totalRemaining = filteredKasa.reduce((acc, ev) => {
            const p = parsePrice(ev.price);
            const d = parsePrice(ev.deposit);
            const isPaid = ev.paymentStatus === 'alindi';
            return acc + (isPaid ? 0 : (p - d));
        }, 0);

        const grandTotal = filteredKasa.reduce((acc, ev) => acc + parsePrice(ev.price), 0);

        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

        return (
            <div className="w-full max-w-6xl mx-auto space-y-6 mt-6 pb-24">
                {/* Header & Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif text-[#2D2926]">Kasa & Finansal Takip</h2>
                            <p className="text-sm text-gray-400 mt-1">Organizasyon bazlı kazanç ve alacak tablosu.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-sm">
                            <select
                                value={kasaMonth}
                                onChange={(e) => setKasaMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="px-3 py-2 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                            >
                                <option value="all">Tüm Aylar</option>
                                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <div className="w-px bg-gray-200 my-2 mx-1"></div>
                            <select
                                value={kasaYear}
                                onChange={(e) => setKasaYear(Number(e.target.value))}
                                className="px-3 py-2 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const y = new Date().getFullYear() - 2 + i;
                                    return <option key={y} value={y}>{y}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tarih</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Organizasyon</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tür</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Toplam</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Alınan</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Kalan</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Durum</th>
                                    {isAdmin && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">İşlem</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredKasa.map(ev => {
                                    const price = parsePrice(ev.price);
                                    const deposit = parsePrice(ev.deposit);
                                    const remaining = price - deposit;
                                    const isPaid = ev.paymentStatus === 'alindi';
                                    const style = getEventStyle(ev.eventType || 'diğer');
                                    const eventDate = new Date(ev.date);

                                    return (
                                        <tr key={ev.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-500">
                                                {!isNaN(eventDate.getTime()) 
                                                    ? eventDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
                                                    : '---'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#2D2926]">{ev.title}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <User size={10} /> {ev.firstName} {ev.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight ${style.bg} ${style.text} border ${style.border}`}>
                                                    {ev.eventType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-gray-700">{price.toLocaleString('tr-TR')} ₺</td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">{(isPaid ? price : deposit).toLocaleString('tr-TR')} ₺</td>
                                            <td className="px-6 py-4 text-right font-black text-orange-600">{(isPaid ? 0 : remaining).toLocaleString('tr-TR')} ₺</td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                    ev.paymentStatus === 'alindi' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    ev.paymentStatus === 'isimolasi' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    'bg-gray-50 text-gray-500 border border-gray-100'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                        ev.paymentStatus === 'alindi' ? 'bg-emerald-500' :
                                                        ev.paymentStatus === 'isimolasi' ? 'bg-amber-400' :
                                                        'bg-gray-400'
                                                    }`} />
                                                    {ev.paymentStatus === 'alindi' ? 'Tamamı Alındı' : ev.paymentStatus === 'isimolasi' ? 'Kapora' : 'Beklemede'}
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleOpenKasaEdit(ev)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                                                            title="Ödeme Bilgilerini Düzenle"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setKasaDeletingId(ev.id)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                                            title="İşlemi Sil / İptal Et"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                                {filteredKasa.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 8 : 7} className="px-6 py-20 text-center text-gray-400 italic font-serif">
                                            Bu dönemde herhangi bir mali kayıt bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Kasaya Giren Toplam</p>
                        <p className="text-4xl font-serif">{totalEarned.toLocaleString('tr-TR')} ₺</p>
                        <div className="mt-4 flex items-center gap-2 text-emerald-200">
                            <CheckCircle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Tahsil Edilen Tutar</span>
                        </div>
                    </div>

                    <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Bekleyen (Alacak)</p>
                        <p className="text-4xl font-serif">{totalRemaining.toLocaleString('tr-TR')} ₺</p>
                        <div className="mt-4 flex items-center gap-2 text-orange-200">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Henüz Alınmamış Ödemeler</span>
                        </div>
                    </div>

                    <div className="bg-[#2D2926] p-8 rounded-[2.5rem] text-white shadow-xl shadow-stone-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Genel Brüt Hacim</p>
                        <p className="text-4xl font-serif">{grandTotal.toLocaleString('tr-TR')} ₺</p>
                        <div className="mt-4 flex items-center gap-2 text-gray-400">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Toplam İş Bedeli</span>
                        </div>
                    </div>
                </div>

                {/* Kasa Edit Modal */}
                {kasaEditingId && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Edit3 className="text-orange-500" size={20} />
                                    Ödeme Bilgilerini Düzenle
                                </h3>
                                <button onClick={() => setKasaEditingId(null)} className="text-gray-400 hover:text-orange-600 bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Toplam Ücret (₺)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={kasaEditForm.price}
                                        onChange={e => setKasaEditForm({ ...kasaEditForm, price: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none focus:bg-white transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Alınan Kapora (₺)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={kasaEditForm.deposit}
                                        onChange={e => setKasaEditForm({ ...kasaEditForm, deposit: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none focus:bg-white transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Ödeme Durumu</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { val: 'beklemede', label: 'Beklemede', dotColor: 'bg-gray-400' },
                                            { val: 'isimolasi', label: 'Kapora', dotColor: 'bg-amber-400' },
                                            { val: 'alindi', label: 'Tamamı Alındı', dotColor: 'bg-emerald-500' },
                                        ].map(o => (
                                            <label
                                                key={o.val}
                                                className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all text-center ${
                                                    kasaEditForm.paymentStatus === o.val
                                                        ? 'border-orange-500 bg-orange-50 shadow-sm ring-1 ring-orange-500'
                                                        : 'border-gray-200 hover:border-orange-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="kasaPaymentStatus"
                                                    value={o.val}
                                                    checked={kasaEditForm.paymentStatus === o.val}
                                                    onChange={e => setKasaEditForm({ ...kasaEditForm, paymentStatus: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-2 h-2 rounded-full ${o.dotColor}`} />
                                                <span className="text-xs font-bold text-gray-700">{o.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kalan Ödeme</span>
                                        <span className="text-xl font-black text-[#2D2926]">
                                            {(kasaEditForm.paymentStatus === 'alindi' ? 0 : (Number(kasaEditForm.price || 0) - Number(kasaEditForm.deposit || 0))).toLocaleString('tr-TR')} ₺
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setKasaEditingId(null)}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveKasaEdit}
                                    className="px-5 py-2.5 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors text-sm font-bold flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Kasa Delete Confirmation Modal */}
                {kasaDeletingId && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={28} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">İşlemi Sil</h3>
                                <p className="text-sm text-gray-500">
                                    Bu organizasyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </p>
                            </div>
                            <div className="px-6 pb-6 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setKasaDeletingId(null)}
                                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold flex-1"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={() => handleDeleteKasaEvent(kasaDeletingId)}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 flex-1"
                                >
                                    <Trash2 size={16} />
                                    Evet, Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders User Management
     */
    /**
     * Kullanıcı yönetimi ve profil ayarları sayfasını oluşturur
     */
    const renderUserManagement = () => {
        const adminCount = users.filter(u => u.role === 'admin').length;
        const editorCount = users.filter(u => u.role === 'editor').length;

        return (
            <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8">
                {/* Header & Tab Navigation */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-stone-100/40 border border-gray-100 overflow-hidden">
                    <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
                        <div className="absolute top-0 left-0 w-2 bg-orange-500 h-full"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-serif text-[#2D2926] flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                                    <ShieldCheck size={32} />
                                </div>
                                {userSubTab === 'users' ? 'Erişim & Yetki' : 'Hesap Ayarlarınız'}
                            </h2>
                            <p className="text-stone-400 mt-3 text-[15px] max-w-lg font-light leading-relaxed">
                                {userSubTab === 'users'
                                    ? 'Sisteme erişebilecek ekip üyelerini tanımlayın ve yetki seviyelerini yönetin.'
                                    : 'Giriş yapmış olduğunuz hesabın parolasını ve kullanıcı adını güncelleyin.'}
                            </p>
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <div className="bg-stone-50 px-8 py-5 rounded-[2rem] border border-stone-100 min-w-[140px] text-center">
                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2">Aktif Hesaplar</p>
                                <p className="text-3xl font-serif text-stone-800">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Internal Tabs */}
                    <div className="flex border-t border-gray-50 p-2 gap-2 bg-stone-50/30">
                        <button
                            onClick={() => setUserSubTab('users')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${userSubTab === 'users' ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Users size={16} /> Ekip Yönetimi
                        </button>
                        <button
                            onClick={() => setUserSubTab('account')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${userSubTab === 'account' ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <User size={16} /> Kişisel Profilim
                        </button>
                    </div>
                </div>

                {systemMessage && (
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-4 ${systemMessage.type === 'success' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
                        {systemMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {systemMessage.text}
                    </div>
                )}

                {userSubTab === 'users' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Left Column: Form and Stats */}
                        <div className="xl:col-span-4 space-y-8">
                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-[2rem] text-white shadow-lg shadow-orange-200/50">
                                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Yöneticiler</p>
                                    <p className="text-3xl font-serif">{adminCount}</p>
                                </div>
                                <div className="bg-gradient-to-br from-stone-700 to-stone-800 p-5 rounded-[2rem] text-white shadow-lg shadow-stone-200/50">
                                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Editörler</p>
                                    <p className="text-3xl font-serif">{editorCount}</p>
                                </div>
                            </div>

                            {/* Add User Form */}
                            {userRole === 'admin' ? (
                                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-stone-100/50 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                                    <h3 className="font-bold text-xs text-stone-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                        <Plus size={14} className="text-orange-500" /> Yeni Erişim Tanımla
                                    </h3>
                                    <form onSubmit={handleCreateUser} className="space-y-6 relative">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Kullanıcı Adı</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    value={newUserForm.username}
                                                    onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-stone-300"
                                                    placeholder="ör: hakan_k"
                                                />
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Geçici Şifre</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    required
                                                    value={newUserForm.password}
                                                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-stone-300"
                                                    placeholder="••••••••"
                                                />
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider ml-1">Erişim Rolü</label>
                                            <div className="relative">
                                                <select
                                                    value={newUserForm.role}
                                                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                                    className="w-full pl-12 pr-10 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:border-orange-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="editor">İçerik Editörü</option>
                                                    <option value="admin">Sistem Yöneticisi</option>
                                                </select>
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-[#2D2926] text-white py-5 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black transition-all shadow-xl shadow-stone-200 active:scale-[0.98] mt-4">
                                            Erişimi Oluştur
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-amber-50/50 rounded-[2.5rem] p-10 border border-amber-100 text-center space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-amber-500 shadow-sm border border-amber-100">
                                        <Lock size={24} />
                                    </div>
                                    <h3 className="font-bold text-amber-900 font-serif">Kısıtlı Alan</h3>
                                    <p className="text-amber-700/70 text-[13px] leading-relaxed">Ekip üyesi eklemek için Yönetici yetkisi gerekmektedir.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column: User List */}
                        <div className="xl:col-span-8 space-y-6">
                            <div className="flex items-center justify-between px-4 mb-2">
                                <h3 className="font-bold text-[10px] text-stone-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <List size={14} /> Kayıtlı Üyeler
                                </h3>
                                <span className="text-[10px] bg-stone-100 text-stone-500 font-bold px-3 py-1 rounded-full">{users.length} Hesap</span>
                            </div>

                            <div className="grid gap-4">
                                {users.map((u, idx) => {
                                    const isAdmin = u.role === 'admin';
                                    return (
                                        <div key={u.id} className="bg-white rounded-[2rem] p-4 pr-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-stone-100 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-serif shadow-inner ${isAdmin ? 'bg-orange-50 text-orange-500' : 'bg-stone-50 text-stone-500'}`}>
                                                        {u.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-bold text-[#2D2926] text-xl font-serif tracking-tight">{u.username}</p>
                                                            <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isAdmin ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-stone-50 text-stone-600 border-stone-100'}`}>
                                                                {isAdmin ? 'Yönetici' : 'Editör'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[11px] text-stone-400">
                                                            <span className="flex items-center gap-1.5"><Shield size={12} className="text-orange-300" /> v{idx + 1}.0</span>
                                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-stone-300" /> Aktif Hesap</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {userRole === 'admin' && loginUsername !== u.username ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(u);
                                                                    setEditUserForm({
                                                                        username: u.username || '',
                                                                        password: '',
                                                                        role: u.role || 'editor'
                                                                    });
                                                                }}
                                                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-stone-50 text-stone-400 hover:bg-orange-50 hover:text-orange-500 transition-all group-hover:bg-orange-50"
                                                                title="Düzenle"
                                                            >
                                                                <Edit3 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all group-hover:bg-red-50"
                                                                title="Erişimi Kaldır"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (u.username === loginUsername ? (
                                                        <div className="bg-[#2D2926] text-white px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-stone-200">
                                                            Aktif Oturum
                                                        </div>
                                                    ) : null)}
                                                </div>
                                            </div>

                                            {/* Edit Form (Inline) */}
                                            {editingUser?.id === u.id && (
                                                <div className="mt-6 pt-6 border-t border-stone-50 animate-in fade-in slide-in-from-top-2">
                                                    <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2 ml-1">Kullanıcı Adı</label>
                                                            <input
                                                                type="text"
                                                                value={editUserForm.username}
                                                                onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
                                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-orange-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-2 ml-1">Yeni Şifre (İsteğe Bağlı)</label>
                                                            <input
                                                                type="password"
                                                                placeholder="Değişmeyecekse boş bırakın"
                                                                value={editUserForm.password}
                                                                onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-orange-500"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-700">
                                                                Güncelle
                                                            </button>
                                                            <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-3 bg-stone-100 text-stone-500 rounded-xl text-[10px] font-bold uppercase hover:bg-stone-200">
                                                                İptal
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {users.length === 0 && (
                                <div className="bg-stone-50/50 rounded-[3rem] py-24 text-center border-2 border-dashed border-stone-100">
                                    <Users className="mx-auto text-stone-200 mb-6" size={64} />
                                    <p className="text-stone-400 font-medium italic font-serif">Sistemde kayıtlı kullanıcı bulunamadı.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Account Settings / Password Change Section */
                    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {apiMessage && (
                            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-4 ${apiMessage.type === 'success' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
                                {apiMessage.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                                {apiMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateAuth} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-stone-100/50 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-[0.2em] ml-1">Kullanıcı Adınızı Güncelleyin</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            placeholder="Aynı kalacaksa boş bırakın"
                                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-3xl text-sm focus:border-orange-500 focus:bg-white outline-none transition-all"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-[0.2em] ml-1">Yeni Şifreniz</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Değiştirmeyecekseniz boş bırakın"
                                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-3xl text-sm focus:border-orange-500 focus:bg-white outline-none transition-all"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50/50 rounded-[2rem] p-8 border border-orange-100/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-orange-600 mb-3 uppercase tracking-[0.2em]">
                                        <ShieldCheck size={14} />
                                        Güvenlik Doğrulaması <span className="text-red-400">*</span>
                                    </label>
                                    <p className="text-xs text-orange-800/60 leading-relaxed font-light">
                                        Değişiklikleri onaylamak için lütfen <strong>güncel şifrenizi</strong> girin.
                                    </p>
                                </div>
                                <div className="flex-1 md:max-w-xs w-full">
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Mevcut parolanız..."
                                        required
                                        className="w-full px-6 py-4 bg-white border border-orange-200 rounded-2xl text-sm focus:border-orange-500 focus:ring-8 focus:ring-orange-500/5 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isUpdating || !currentPassword || (!newUsername && !newPassword)}
                                    className="px-12 py-5 bg-[#2D2926] text-white font-bold tracking-[0.3em] uppercase text-[10px] rounded-2xl hover:bg-black transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl active:scale-95"
                                >
                                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isUpdating ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ UYGULA'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders Session Logs
     */
    /**
     * Sistem giriş logları sayfasını oluşturur
     */
    const renderSessionLogs = () => (
        <div className="w-full max-w-5xl mx-auto mt-10">
            <div className="bg-white rounded-3xl shadow-xl shadow-[#2D2926]/5 border border-[#2D2926]/5 p-8 md:p-12">
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-serif text-[#2D2926] flex items-center gap-3">
                        <Clock size={24} className="text-[#F97316]" />
                        Oturum Geçmişi
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">Sisteme yapılan en son {(content?.systemSettings?.sessionLogLimit !== undefined && content?.systemSettings?.sessionLogLimit !== null && content?.systemSettings?.sessionLogLimit !== '') ? content.systemSettings.sessionLogLimit : '10'} giriş denemesini buradan görüntüleyebilirsiniz.</p>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-[#FDFCFB] border-b border-gray-100 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">
                            <tr>
                                <th className="px-6 py-5">Tarih / Saat</th>
                                <th className="px-6 py-5">Kullanıcı Adı</th>
                                <th className="px-6 py-5">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sessionLogs.slice(0, parseInt((content?.systemSettings?.sessionLogLimit !== undefined && content?.systemSettings?.sessionLogLimit !== null && content?.systemSettings?.sessionLogLimit !== '') ? content.systemSettings.sessionLogLimit : '10')).map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(log.loginTime).toLocaleString('tr-TR', {
                                            day: '2-digit', month: 'long', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#2D2926]">{log.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.status === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                            {log.status === 'success' ? 'Başarılı' : 'Başarısız'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {sessionLogs.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">Henüz kaydedilmiş bir oturum bilgisi yok.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const handleDeleteInquiry = async (id: string) => {
        try {
            const res = await fetch(`/api/inquiries?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setInquiries(prev => prev.filter(inq => inq.id !== id));
                setInquiryDeletingId(null);
                setMessage({ type: 'success', text: 'Başvuru başarıyla silindi.' });
                setTimeout(() => setMessage(null), 2500);
            } else {
                throw new Error('Silinemedi.');
            }
        } catch {
            setMessage({ type: 'error', text: 'Silinirken bir hata oluştu.' });
        }
    };


    const handleUpdateInquiry = async (id: string, status: string, note: string) => {
        try {
            const res = await fetch('/api/inquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, note }),
            });
            if (res.ok) {
                setInquiries(prev => prev.map(inq =>
                    inq.id === id ? { ...inq, status, note } : inq
                ));
                setMessage({ type: 'success', text: 'Durum güncellendi.' });
                setTimeout(() => setMessage(null), 2500);
            }
        } catch {
            setMessage({ type: 'error', text: 'Güncelleme başarısız.' });
        }
    };

    /**
     * Müşteri başvuruları (Inquiries) yönetim sayfasını oluşturur
     */
    const renderInquiries = () => {
        const filtered = inquiries.filter(inq => {
            const searchTerms = [inq.name, inq.message, inq.email, inq.phone].map(v => (v || '').toLowerCase());
            const matchesSearch = searchTerms.some(t => t.includes(inquirySearch.toLowerCase()));
            const matchesType = inquiryFilter === 'all' || inq.eventType === inquiryFilter;

            // Okundu/Okunmadı filtrelemesi
            const status = inq.status || 'beklemede';
            const matchesReadState = inquiryTypeFilter === 'unread'
                ? status === 'beklemede'
                : status !== 'beklemede';

            return matchesSearch && matchesType && matchesReadState;
        });

        const total = filtered.length;
        const unreadCount = inquiries.filter(i => (i.status || 'beklemede') === 'beklemede').length;
        const readCount = inquiries.filter(i => (i.status || 'beklemede') !== 'beklemede').length;

        return (
            <div className="w-full max-w-4xl mx-auto py-6 px-2">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-serif text-[#2D2926] flex items-center gap-3">
                            <Mail size={24} className="text-[#F97316]" />
                            Başvuru Havuzu
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Müşteri taleplerini buradan takip edebilirsiniz.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="İsim, mesaj veya tel ara..."
                                value={inquirySearch}
                                onChange={(e) => setInquirySearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none w-64 shadow-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </div>
                </div>

                {/* Sub Tabs */}
                <div className="flex gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setInquiryTypeFilter('unread')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${inquiryTypeFilter === 'unread' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Clock size={16} /> Bekleyenler ({unreadCount})
                    </button>
                    <button
                        onClick={() => setInquiryTypeFilter('read')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${inquiryTypeFilter === 'read' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <CheckCircle size={16} /> Okunanlar ({readCount})
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {total} {inquiryTypeFilter === 'unread' ? 'Yeni Başvuru' : 'İşlenmiş Kayıt'}
                    </p>
                    <select
                        value={inquiryFilter}
                        onChange={(e) => setInquiryFilter(e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-gray-500 border-none focus:ring-0 cursor-pointer hover:text-orange-500 transition-colors"
                    >
                        <option value="all">Filtrele: Tümü</option>
                        {Array.from(new Set(inquiries.map(i => i.eventType))).filter(Boolean).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Inquiry Cards */}
                <div className="space-y-4">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 py-24 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 mx-auto mb-6">
                                {inquiryTypeFilter === 'unread' ? <Mail size={32} /> : <CheckCircle size={32} />}
                            </div>
                            <p className="text-gray-400 font-medium italic font-serif">
                                {inquiryTypeFilter === 'unread' ? 'Henüz bekleyen yeni bir başvuru yok.' : 'Okunmuş başvuru bulunmuyor.'}
                            </p>
                        </div>
                    ) : (
                        filtered.map(inq => <InquiryCard key={inq.id} inq={inq} onUpdate={handleUpdateInquiry} onDelete={(id) => setInquiryDeletingId(id)} />)
                    )}
                </div>

                {/* Inquiry Delete Confirmation Modal */}
                {inquiryDeletingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={28} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Başvuruyu Sil</h3>
                                <p className="text-sm text-gray-500 px-4">
                                    Bu müşteri başvurusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </p>
                            </div>
                            <div className="px-6 pb-6 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setInquiryDeletingId(null)}
                                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold flex-1"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={() => handleDeleteInquiry(inquiryDeletingId)}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 flex-1"
                                >
                                    <Trash2 size={16} />
                                    Evet, Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Renders General System Settings
     */
    /**
     * Genel sistem kısıtlamaları ve ayarları sayfasını oluşturur
     */
    const renderSystemSettings = () => {
        const settings = {
            maxImageSize: '10',
            maxGalleryImages: '30',
            sessionLogLimit: '10',
            allowedImageFormats: '.jpg,.jpeg,.png,.webp,.gif',
            maintenanceMode: 'false',
            ...(content?.systemSettings || {})
        };

        const settingFields = [
            { key: 'maxImageSize', label: 'Maksimum Resim Boyutu (MB)', placeholder: '10', icon: <Upload size={16} className="text-orange-500" />, description: 'Yüklenebilecek maksimum resim dosyası boyutu (MB).', type: 'number' },
            { key: 'maxGalleryImages', label: 'Maksimum Galeri Resim Sayısı', placeholder: '30', icon: <ImageIcon size={16} className="text-purple-500" />, description: 'Galeriye eklenebilecek maksimum toplam resim sayısı.', type: 'number' },
            { key: 'sessionLogLimit', label: 'Oturum Kaydı Gösterim Sınırı', placeholder: '10', icon: <Clock size={16} className="text-blue-500" />, description: 'Yönetim panelinde gösterilecek son oturum işlemlerinin sayısı.', type: 'number' },
            { key: 'allowedImageFormats', label: 'İzin Verilen Resim Formatları', placeholder: '.jpg,.jpeg,.png,.webp', icon: <ImageIcon size={16} className="text-emerald-500" />, description: 'Yüklenmesine izin verilen dosya uzantıları (virgülle ayırın).', type: 'text' },
            { key: 'maintenanceMode', label: 'Bakım Modu', icon: <Lock size={16} className="text-red-500" />, description: 'Siteyi ziyaretçilere kapatır (Henüz aktif değil, altyapı hazır).', type: 'toggle' },
        ];

        return (
            <div className="w-full max-w-3xl mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-500 shadow-inner">
                            <Settings size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif text-[#2D2926]">Genel Sistem Ayarları</h2>
                            <p className="text-sm text-gray-400 mt-1">Sistem kısıtlamalarını ve genel çalışma parametrelerini buradan yönetin.</p>
                        </div>
                    </div>
                </div>

                {/* Fields */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-7">
                    {settingFields.map((field) => (
                        <div key={field.key} className="group">
                            <label className="flex items-center gap-2.5 text-sm font-bold text-gray-700 mb-2">
                                {field.icon}
                                {field.label}
                            </label>
                            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{field.description}</p>

                            {field.type === 'toggle' ? (
                                <button
                                    onClick={() => handleChange(['systemSettings', field.key], settings[field.key] === 'true' ? 'false' : 'true')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings[field.key] === 'true' ? 'bg-orange-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[field.key] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            ) : (
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={settings[field.key] || ''}
                                    onChange={(e) => handleChange(['systemSettings', field.key], e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 outline-none transition-all text-gray-700 placeholder:text-gray-300"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Statistics Management */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-700">İstatistik Yönetimi</h3>
                            <p className="text-[11px] text-gray-400">Site trafik verilerini buradan yönetin.</p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <p className="text-xs font-bold text-[#2D2926] mb-1">Günlük Ziyaretçileri Sıfırla</p>
                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                Bugünkü ziyaretçi ve sayfa görüntüleme sayılarını sıfırlar. Bu işlem geri alınamaz.
                            </p>
                        </div>
                        <button
                            onClick={handleResetStats}
                            className="px-6 py-3 bg-white border border-orange-200 text-orange-600 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            Verileri Temizle
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders Meta Settings (SEO)
     */
    /**
     * SEO ve Meta etiketleri (Başlık, Açıklama, Görsel) ayarlarını oluşturur
     */
    const renderMetaSettings = () => {
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
                                    maxSizeMB={parseInt(content?.systemSettings?.maxImageSize || '10')}
                                    allowedFormats={content?.systemSettings?.allowedImageFormats || '.jpg,.jpeg,.png,.webp'}
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

    /**
     * acticeSection degerine gore yalililmis bilesen onizlemesini olusturur
     */
    /**
     * Seçili bölüme göre sayfa önizlemesini veya özel yönetim sayfasını oluşturur
     */
    const renderPreview = () => {
        if (!content || !activeSection) return <div className="p-12 text-center text-gray-400 italic">Sol menüden bir alan seçin...</div>;

        if (activeSection === 'stats') return <DashboardStats stats={stats} inquiries={inquiries} events={events} overviewPeriod={overviewPeriod} setOverviewPeriod={setOverviewPeriod} />;
        if (activeSection === 'system_users') return renderUserManagement();
        if (activeSection === 'system_sessions') return renderSessionLogs();
        if (activeSection === 'system_meta') return renderMetaSettings();
        if (activeSection === 'system_settings') return renderSystemSettings();
        if (activeSection === 'inquiries') return renderInquiries();
        if (activeSection === 'kasa') return renderKasa();

        switch (activeSection) {
            case 'hero':
                return <HeroSection data={content.hero} />;
            case 'philosophy':
                return <PhilosophySection data={content.philosophy} />;
            case 'servicesMeta':
            case 'services':
                return <ServicesGrid data={content.services} meta={content.servicesMeta} showIndex={true} />;
            case 'testimonialsMeta':
            case 'testimonials':
                return <TestimonialsSlider data={content.testimonials} meta={content.testimonialsMeta} showIndex={true} />;
            case 'projectsMeta':
            case 'projects':
                return <ProjectsSlider data={content.projects} meta={content.projectsMeta} showIndex={true} />;
            case 'brand':
                return (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100">
                        <h4 className="text-xl font-serif mb-6">Logo ve Başlık Ön İzleme</h4>
                        <div className="flex flex-col gap-8 items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Ana Logo</p>
                                {content.brand.logo ? <img src={content.brand.logo} className="h-20 object-contain" /> : <div className="h-20 w-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">Görsel Yok</div>}
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Açık Renk Logo (Koyu Zemin)</p>
                                <div className="bg-[#2D2926] p-6 rounded-xl">
                                    {content.brand.logoLight ? <img src={content.brand.logoLight} className="h-16 object-contain" /> : <div className="h-16 w-32 bg-white/10 rounded-lg flex items-center justify-center text-white/30 italic">Logo Yok</div>}
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Site Adı</p>
                                <p className="text-4xl font-serif">{content.brand.siteName}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'gallery':
                return <GallerySection images={content.gallery} />;
            case 'contact':
                return <InquiryForm data={content.contact} />;
            case 'footer':
                return <Footer data={content.footer} brand={content.brand} />;
            default:
                return (
                    <div className="text-center py-20 text-gray-500">
                        <LayoutDashboard size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Lütfen sol menüden bir alan seçin.</p>
                    </div>
                );
        }
    };

    // Kimlik dogrulama kontrol yukleyicisi
    if (isAuthChecking) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#FDFCFB]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2D2926]" />
            </div>
        );
    }

    // GIRIS EKRANI
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#FDFCFB] text-[#2D2926] relative overflow-hidden font-sans">
                {/* Background organic decoration matching main site */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#FFF7ED] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] blur-3xl mix-blend-multiply" />
                    <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-[#FFF7ED]/60 rounded-[60%_40%_30%_70%_/_50%_60%_50%_40%] blur-3xl mix-blend-multiply" />
                </div>

                <div className="relative z-10 w-full max-w-md px-6">
                    {/* Login Card */}
                    <div className="bg-white border border-[#2D2926]/10 rounded-2xl shadow-xl shadow-[#2D2926]/5 p-10">
                        {/* Logo */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold tracking-tight text-[#2D2926]">
                                MITRA <span className="font-light text-gray-500">Admin</span>
                            </h1>
                            <div className="h-px w-16 bg-[#2D2926] mx-auto mt-4 mb-3 opacity-20"></div>
                            <p className="text-sm text-gray-500">Yönetim paneline erişmek için giriş yapın</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Kullanıcı Adı</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        placeholder="Kullanıcı adınız"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[#2D2926] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D2926]/20 focus:border-[#2D2926] focus:bg-white transition-all text-sm"
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-[0.15em]">Şifre</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-[#2D2926] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D2926]/20 focus:border-[#2D2926] focus:bg-white transition-all text-sm"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {loginError && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[13px] animate-[shake_0.3s_ease-in-out]">
                                    <AlertCircle size={15} className="flex-shrink-0" />
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-3.5 bg-[#2D2926] text-white font-medium tracking-wide rounded-xl hover:bg-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#2D2926]/20 flex items-center justify-center gap-2 text-sm"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Giriş yapılıyor...
                                    </>
                                ) : (
                                    'Giriş Yap'
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[11px] text-gray-400 mt-8 tracking-wider uppercase">© 2026 Mitra Event</p>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                `}} />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50 text-red-500 font-medium">
                Veri bulunamadı veya yüklenemedi.
            </div>
        );
    }

    const isStatsView = activeSection === 'stats';
    const isSystemUsersView = activeSection === 'system_users';
    const isSystemSessionsView = activeSection === 'system_sessions';
    const isMetaView = activeSection === 'system_meta';
    const isSystemSettingsView = activeSection === 'system_settings';
    const isInquiriesView = activeSection === 'inquiries';
    const isEventsView = activeSection === 'events';
    const isKasaView = activeSection === 'kasa';
    const isMediaLibraryView = activeSection === 'media_library';
    const isFullScreenView = isStatsView || isSystemUsersView || isSystemSessionsView || isInquiriesView || isMediaLibraryView || isKasaView || isEventsView;

    const getPageTitle = () => {
        if (isStatsView) return 'İstatistikler';
        if (isSystemUsersView) return 'Kullanıcı Yönetimi';
        if (isSystemSessionsView) return 'Oturum Geçmişi';
        if (isMetaView) return 'Meta & SEO Ayarları';
        if (isInquiriesView) return 'Başvurular';
        if (isKasaView) return 'Kasa & Finans';
        if (isMediaLibraryView) return 'Resim Galerisi';
        if (activeSection && sectionConfig[activeSection]) return sectionConfig[activeSection].label;
        return 'Yönetim Paneli';
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50/50 font-sans text-gray-900 selection:bg-[#FFF7ED]">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[30] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* LEFT SIDEBAR */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-[#2D2926]/10 flex flex-col shadow-sm z-[40] flex-shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-[#2D2926]/5">
                    <span className="text-xl font-bold tracking-tight text-[#2D2926]">MITRA <span className="font-light text-gray-400">Admin</span></span>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto py-3 space-y-1">

                    {/* İstatistikler (Genel Bakış) */}
                    <div className="px-3">
                        <button
                            onClick={() => { setActiveSection('stats'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isStatsView
                                ? 'bg-orange-50 text-orange-700 font-bold border-l-2 border-orange-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                }`}
                        >
                            <span className={isStatsView ? 'text-orange-500' : 'text-gray-400'}><BarChart3 size={16} /></span>
                            Genel Bakış
                        </button>
                    </div>

                    <div className="mx-3 border-t border-gray-100" />

                    {/* Başvurular — Ana Menü */}
                    <div className="px-3">
                        <button
                            onClick={() => { setActiveSection('inquiries'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isInquiriesView
                                ? 'bg-[#F97316]/10 text-[#F97316] font-bold border-l-2 border-[#F97316]'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                }`}
                        >
                            <span className={isInquiriesView ? 'text-[#F97316]' : 'text-gray-400'}><Mail size={16} /></span>
                            Gelen Başvurular
                            {inquiries.filter(i => (i.status || 'beklemede') === 'beklemede').length > 0 && (
                                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {inquiries.filter(i => (i.status || 'beklemede') === 'beklemede').length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="mx-3 border-t border-gray-100" />

                    {/* RESİM GALERİSİ */}
                    <div className="px-3">
                        <button
                            onClick={() => { setActiveSection('media_library'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isMediaLibraryView
                                ? 'bg-orange-50 text-orange-700 font-bold border-l-2 border-orange-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                }`}
                        >
                            <span className={isMediaLibraryView ? 'text-orange-500' : 'text-gray-400'}><ImageIcon size={16} /></span>
                            Resim Galerisi
                        </button>
                    </div>

                    <div className="mx-3 border-t border-gray-100" />

                    {/* Takvim ve Organizasyon */}
                    <div className="px-3">
                        <p className="px-3 py-2 text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase">Takvimde Organizasyon Oluştur</p>
                        <button
                            onClick={() => { setActiveSection('events'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isEventsView
                                ? 'bg-orange-50 text-orange-700 font-bold border-l-2 border-orange-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                }`}
                        >
                            <span className={isEventsView ? 'text-orange-500' : 'text-gray-400'}><CalendarDays size={16} /></span>
                            Takvim & Org.
                            {events.filter(e => {
                                if (!e.reminderDays) return false;
                                const eventDate = new Date(e.date);
                                const today = new Date();
                                const diffTime = eventDate.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return diffDays >= 0 && diffDays <= e.reminderDays;
                            }).length > 0 && (
                                    <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {events.filter(e => {
                                            const eventDate = new Date(e.date);
                                            const today = new Date();
                                            const diffTime = eventDate.getTime() - today.getTime();
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            return diffDays >= 0 && diffDays <= e.reminderDays;
                                        }).length}
                                    </span>
                                )}
                        </button>
                    </div>

                    <div className="px-3">
                        <button
                            onClick={() => { setActiveSection('kasa'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isKasaView
                                ? 'bg-emerald-50 text-emerald-700 font-bold border-l-2 border-emerald-500'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                }`}
                        >
                            <span className={isKasaView ? 'text-emerald-500' : 'text-gray-400'}><TrendingUp size={16} /></span>
                            Kasa Bölümü
                        </button>
                    </div>

                    <div className="mx-3 border-t border-gray-100" />

                    {/* İçerik Alanları (Sayfa Düzeni) */}
                    <div className="px-3">
                        <button
                            className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase hover:text-[#2D2926] transition-colors"
                            onClick={() => setIsSectionsOpen(!isSectionsOpen)}
                        >
                            <span>Sayfa Düzeni</span>
                            {isSectionsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </button>
                        {isSectionsOpen && (
                            <div className="space-y-0.5 mt-1">
                                {Object.keys(sectionConfig).filter(k => k !== 'inquiries').map((key) => {
                                    const isActive = activeSection === key;
                                    const config = sectionConfig[key];
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => { setActiveSection(key); setIsSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${isActive
                                                ? 'bg-[#FDFCFB] text-[#2D2926] font-bold shadow-sm border-l-2 border-[#2D2926]'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                                }`}
                                        >
                                            <span className={isActive ? 'text-[#2D2926]' : 'text-gray-400'}>{config.icon}</span>
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sistem Menüsü - Sadece Yetkililer */}
                    {userRole === 'admin' && (
                        <>
                            <div className="mx-3 border-t border-gray-100 mt-2 mb-2" />
                            <div className="px-3">
                                <button
                                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase hover:text-[#2D2926] transition-colors"
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                >
                                    <span>SİSTEM AYARLARI</span>
                                    {isSettingsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                </button>
                                {isSettingsOpen && (
                                    <div className="space-y-0.5 mt-1">
                                        <button
                                            onClick={() => { setActiveSection('system_settings'); setIsSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${activeSection === 'system_settings'
                                                ? 'bg-[#FDFCFB] text-[#2D2926] font-bold shadow-sm border-l-2 border-[#2D2926]'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                                }`}
                                        >
                                            <span className={activeSection === 'system_settings' ? 'text-[#2D2926]' : 'text-gray-400'}><Settings size={16} /></span>
                                            Genel Ayarlar
                                        </button>
                                        <button
                                            onClick={() => { setActiveSection('system_users'); setIsSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${activeSection === 'system_users'
                                                ? 'bg-[#FDFCFB] text-[#2D2926] font-bold shadow-sm border-l-2 border-[#2D2926]'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                                }`}
                                        >
                                            <span className={activeSection === 'system_users' ? 'text-[#2D2926]' : 'text-gray-400'}><Users size={16} /></span>
                                            Kullanıcı Yönetimi
                                        </button>
                                        <button
                                            onClick={() => { setActiveSection('system_sessions'); setIsSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${activeSection === 'system_sessions'
                                                ? 'bg-[#FDFCFB] text-[#2D2926] font-bold shadow-sm border-l-2 border-[#2D2926]'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                                }`}
                                        >
                                            <span className={activeSection === 'system_sessions' ? 'text-[#2D2926]' : 'text-gray-400'}><Clock size={16} /></span>
                                            Oturum Geçmişi
                                        </button>
                                        <button
                                            onClick={() => { setActiveSection('system_meta'); setIsSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${activeSection === 'system_meta'
                                                ? 'bg-[#FDFCFB] text-[#2D2926] font-bold shadow-sm border-l-2 border-[#2D2926]'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#2D2926]'
                                                }`}
                                        >
                                            <span className={activeSection === 'system_meta' ? 'text-[#2D2926]' : 'text-gray-400'}><Globe size={16} /></span>
                                            Meta Ayarları
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* Sidebar Footer / User Info */}
                <div className="p-4 border-t border-[#2D2926]/5 bg-gray-50/50">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#2D2926] font-bold text-sm uppercase">
                                {loginUsername?.charAt(0) || 'M'}
                            </div>
                            <div className="text-sm overflow-hidden">
                                <p className="font-bold text-[#2D2926] text-[13px] truncate">{loginUsername || 'Yönetici'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{userRole === 'admin' ? 'Yönetici' : 'Editör'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all font-bold text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-red-500/20"
                        >
                            <LogOut size={14} />
                            <span>Sistemden Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ANA ICERIK ALANI */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* TOP HEADER */}
                <header className="h-16 bg-white border-b border-[#2D2926]/5 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 flex-shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Mobile Sidebar Toggle */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 lg:hidden text-gray-400 hover:text-orange-600 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm md:text-lg font-bold text-[#2D2926] flex items-center gap-2">
                            {getPageTitle()}
                        </h1>
                        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FFF7ED]/30 text-[#2D2926] border border-[#2D2926]/10 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Sistem Aktif
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Siteye Git Butonu */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2D2926]/10 text-[#2D2926] hover:bg-gray-50 transition-all font-medium text-[13px] shadow-sm tracking-wide"
                        >
                            <Globe size={16} className="text-gray-400" />
                            Siteye Git
                        </a>

                        {message && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        {!isFullScreenView && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !isDirty}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium text-[13px] shadow-sm tracking-wide ${
                                    isDirty 
                                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                                }`}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        )}
                    </div>
                </header>

                {/* KAYDIRILABILIR ICERIK */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">

                    {isStatsView ? (
                        <div className="w-full max-w-4xl mx-auto">
                            <DashboardStats stats={stats} inquiries={inquiries} events={events} overviewPeriod={overviewPeriod} setOverviewPeriod={setOverviewPeriod} />
                        </div>
                    ) : isSystemUsersView ? (
                        <div className="w-full flex justify-center py-6 px-4 md:px-6">
                            {renderUserManagement()}
                        </div>
                    ) : isSystemSessionsView ? (
                        <div className="w-full flex justify-center py-6 px-4 md:px-6">
                            {renderSessionLogs()}
                        </div>
                    ) : isInquiriesView ? (
                        <div className="w-full flex justify-center px-4 md:px-6">
                            {renderInquiries()}
                        </div>
                    ) : isMetaView ? (
                        <div className="w-full flex justify-center px-4 md:px-6">
                            {renderMetaSettings()}
                        </div>
                    ) : isEventsView ? (
                        <div className="w-full flex justify-center px-4 md:px-6 pb-20">
                            {renderEvents()}
                        </div>
                    ) : isKasaView ? (
                        <div className="w-full flex justify-center px-4 md:px-6 pb-20">
                            {renderKasa()}
                        </div>
                    ) : isMediaLibraryView ? (
                        <div className="w-full flex justify-center px-4 md:px-6 pb-20">
                            <GalleryManager settings={content.systemSettings} />
                        </div>
                    ) : isSystemSettingsView ? (
                        <div className="w-full flex justify-center px-4 md:px-6">
                            {renderSystemSettings()}
                        </div>
                    ) : (
                        <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
                            {/* TOP: THE FORM */}
                            <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 md:p-10">
                                    <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                                <Edit3 size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">İçerik Düzenleme</h2>
                                                <p className="text-xs text-gray-400 mt-0.5">Lütfen aşağıdaki alanları doldurun ve yukarıdan kaydedin.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-8">
                                        {activeSection && content[activeSection] && (
                                            <>
                                                {activeSection === 'services' || activeSection === 'servicesMeta' ? (
                                                    <div className="col-span-full space-y-10">
                                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                            <h3 className="bg-white text-gray-700 px-4 py-1.5 inline-block rounded-lg text-[10px] font-black tracking-widest mb-6 border border-gray-200 uppercase">BAŞLIKLAR BÖLÜMÜ</h3>
                                                            <div className="grid grid-cols-1 gap-y-6">
                                                                {renderFields(content.servicesMeta, ['servicesMeta'])}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                            <h3 className="bg-white text-gray-700 px-4 py-1.5 inline-block rounded-lg text-[10px] font-black tracking-widest mb-6 border border-gray-200 uppercase">HİZMET LİSTESİ BÖLÜMÜ</h3>
                                                            <div className="grid grid-cols-1 gap-y-6">
                                                                {renderFields(content.services, ['services'])}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : activeSection === 'projects' || activeSection === 'projectsMeta' ? (
                                                    <div className="col-span-full space-y-10">
                                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                            <h3 className="bg-white text-gray-700 px-4 py-1.5 inline-block rounded-lg text-[10px] font-black tracking-widest mb-6 border border-gray-200 uppercase">BAŞLIKLAR BÖLÜMÜ</h3>
                                                            <div className="grid grid-cols-1 gap-y-6">
                                                                {renderFields(content.projectsMeta, ['projectsMeta'])}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                            <h3 className="bg-white text-gray-700 px-4 py-1.5 inline-block rounded-lg text-[10px] font-black tracking-widest mb-6 border border-gray-200 uppercase">PROJE LİSTESİ BÖLÜMÜ</h3>
                                                            <div className="grid grid-cols-1 gap-y-6">
                                                                {renderFields(content.projects, ['projects'])}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : activeSection === 'testimonials' || activeSection === 'testimonialsMeta' ? (
                                                    <div className="col-span-full space-y-10">
                                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                            <h3 className="bg-white text-gray-700 px-4 py-1.5 inline-block rounded-lg text-[10px] font-black tracking-widest mb-6 border border-gray-200 uppercase text-center w-full">BAŞLIKLAR BÖLÜMÜ</h3>
                                                            <div className="grid grid-cols-1 gap-y-6">
                                                                {renderFields(content.testimonialsMeta, ['testimonialsMeta'])}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                            <h3 className="bg-white text-gray-700 px-4 py-1.5 inline-block rounded-lg text-[10px] font-black tracking-widest mb-6 border border-gray-200 uppercase text-center w-full">YORUM LİSTESİ BÖLÜMÜ</h3>
                                                            <div className="grid grid-cols-1 gap-y-6">
                                                                {renderFields(content.testimonials, ['testimonials'])}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : activeSection === 'gallery' ? (
                                                    <div className="col-span-full space-y-8">
                                                        <div className="flex items-center justify-between mb-4 px-2">
                                                            <div>
                                                                <h3 className="text-sm font-bold text-gray-900">Görsel Listesi</h3>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">Maksimum {(content.systemSettings?.maxGalleryImages !== undefined && content.systemSettings?.maxGalleryImages !== null && content.systemSettings?.maxGalleryImages !== '') ? content.systemSettings.maxGalleryImages : '30'} resim ekleyebilirsiniz.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowGalleryPicker(true)}
                                                                disabled={content.gallery?.length >= parseInt((content.systemSettings?.maxGalleryImages !== undefined && content.systemSettings?.maxGalleryImages !== null && content.systemSettings?.maxGalleryImages !== '') ? content.systemSettings.maxGalleryImages : '30')}
                                                                className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/10 hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                                            >
                                                                <Plus size={14} /> Yeni Ekle
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {(content.gallery || []).map((item: { img: string, alt: string }, idx: number) => (
                                                                <div key={idx} className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square shadow-sm transition-all hover:shadow-md">
                                                                    <img src={item.img} alt={item.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 border-4 border-white">
                                                                        <button
                                                                            onClick={() => {
                                                                                const newGallery = [...content.gallery];
                                                                                newGallery.splice(idx, 1);
                                                                                handleChange(['gallery'], newGallery);
                                                                            }}
                                                                            className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg active:scale-90"
                                                                            title="Kaldır"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {showGalleryPicker && (
                                                            <MediaPicker
                                                                onSelect={(url) => {
                                                                    const maxImages = parseInt((content.systemSettings?.maxGalleryImages !== undefined && content.systemSettings?.maxGalleryImages !== null && content.systemSettings?.maxGalleryImages !== '') ? content.systemSettings.maxGalleryImages : '30');
                                                                    if ((content.gallery || []).length >= maxImages) {
                                                                        setMessage({ type: 'error', text: `Galeriye en fazla ${maxImages} resim ekleyebilirsiniz.` });
                                                                        setShowGalleryPicker(false);
                                                                        return;
                                                                    }
                                                                    const newGallery = [...(content.gallery || []), { img: url, alt: `Galeri Resim ${content.gallery?.length + 1 || 1}` }];
                                                                    handleChange(['gallery'], newGallery);
                                                                    setShowGalleryPicker(false);
                                                                }}
                                                                onClose={() => setShowGalleryPicker(false)}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {renderFields(content[activeSection], [activeSection])}
                                                    </div>
                                                )}

                                                {typeof content[activeSection] !== 'object' && (
                                                    <div className="flex flex-col col-span-full">
                                                        <label className="text-xs font-semibold text-gray-700 mb-1.5 capitalize">
                                                            {activeSection}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={content[activeSection]}
                                                            onChange={(e) => handleChange([activeSection], e.target.value)}
                                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all shadow-inner"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM: LIVE COMPONENT PREVIEW */}
                            <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="mb-6 flex items-center gap-3 px-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Monitor size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-md font-bold text-gray-900">Canlı Önizleme</h3>
                                        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">Gerçek zamanlı görünüm</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#2D2926]/5 border border-gray-100 overflow-hidden flex flex-col ring-1 ring-black/5">
                                    {/* Compact browser chrome */}
                                    <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4 flex-shrink-0">
                                        <div className="flex gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                                        </div>
                                        <div className="flex-1 bg-white border border-gray-200 rounded-lg py-1 px-4 flex justify-center max-w-sm mx-auto shadow-inner">
                                            <span className="text-[10px] text-gray-400 font-medium tracking-wide">mitraevent.com/{activeSection}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Canlı</span>
                                        </div>
                                    </div>

                                    <div className="p-1 md:p-4 bg-gray-50/30">
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative w-full">
                                            <div className="relative pointer-events-none select-none">
                                                {renderPreview()}
                                                <div className="absolute inset-0 z-50 pointer-events-auto cursor-default"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-minimal::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar-minimal::-webkit-scrollbar-track {
                    background: transparent; 
                }
                .custom-scrollbar-minimal::-webkit-scrollbar-thumb {
                    background: #d1d5db; 
                    border-radius: 4px;
                }
            `}} />

        </div>
    );
}
