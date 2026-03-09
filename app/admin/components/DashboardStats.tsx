import React from 'react';
import { Loader2, LayoutDashboard, Users, Eye, MessageSquare, Clock, CalendarDays, CheckCircle, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { getEventStyle } from './shared';

export const DashboardStats = ({ stats, inquiries, events, overviewPeriod, setOverviewPeriod }: { stats: any, inquiries: any[], events: any[], overviewPeriod: string, setOverviewPeriod: (period: 'aylik' | 'yillik') => void }) => {
    if (!stats) return (
        <div className="text-center py-20 text-gray-500">
            <Loader2 size={32} className="mx-auto text-gray-300 mb-4 animate-spin" />
            <p>Veriler yükleniyor...</p>
        </div>
    );

    const { daily } = stats;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Ziyaretçi Verisi (Bugün)
    const todayStr = now.toISOString().split('T')[0];
    const todayStats = daily.find((d: any) => d.date === todayStr) || daily[daily.length - 1];

    // 2. Başvurular (Dönüşler) - Sadece onaysız/bekleyenleri alalım
    const pendingInquiries = inquiries.filter(i => i.status !== 'onaylandi').length;

    // 3. Etkinlikler (Mevcut dönem filtresine göre)
    const periodEvents = events.filter(e => {
        const d = new Date(e.date);
        if (overviewPeriod === 'aylik') {
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        return d.getFullYear() === currentYear;
    });

    // Yaklaşan İşler: Gelecek tarihteki rezervasyonlar (Ödeme ayırmaksızın)
    const upcomingEvents = periodEvents.filter(e => new Date(e.date) >= now).length;

    // Tamamlanan İşler: Ödemesi tamamen alınmış işler
    const completedEvents = periodEvents.filter(e => e.paymentStatus === 'alindi').length;

    // Kategori (İş Türü) Dağılımı - Takvimdeki verilerden dinamik geliyor
    const categoryCounts = periodEvents.reduce((acc: any, ev: any) => {
        const type = (ev.eventType || 'diğer').toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts).sort((a: any, b: any) => b[1] - a[1]);

    return (
        <div className="space-y-6">

            {/* Ust Bilgi ve Filtre */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="text-orange-500" />
                        Genel Bakış
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Sitenizin güncel performans özetini aşağıdan takip edebilirsiniz.</p>
                </div>

                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setOverviewPeriod('aylik')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${overviewPeriod === 'aylik' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Bu Ay
                    </button>
                    <button
                        onClick={() => setOverviewPeriod('yillik')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${overviewPeriod === 'yillik' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Bu Yıl
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Ziyaretçi */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-orange-600 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Bugünkü Ziyaretçi</p>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{todayStats?.visitors || 0}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                        <Eye size={12} /> {todayStats?.pageViews || 0} Sayfa Görüntüleme
                    </p>
                </div>

                {/* Başvurular */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Talep Başvuruları</p>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{pendingInquiries}</p>
                    <p className="text-[10px] text-amber-600 mt-2 font-bold flex items-center gap-1">
                        <Clock size={12} /> Onay ve İletişim Bekliyor
                    </p>
                </div>

                {/* Yaklaşan İşler */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Yaklaşan İşler</p>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{upcomingEvents}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                        Seçili {overviewPeriod === 'aylik' ? 'ay' : 'yıl'} için gelecek etkinlikler
                    </p>
                </div>

                {/* Tamamlanan İşler */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Tamamlanan İşler</p>
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-green-600">{completedEvents}</p>
                    <p className="text-[10px] text-green-600/70 mt-2 font-bold flex items-center gap-1">
                        <TrendingUp size={12} /> Ödemesi tamamen alınmış
                    </p>
                </div>

            </div>

            {/* Organizasyon Kategori Dağılımı Uzun Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-hidden relative">
                <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <PieChart className="text-orange-500" size={18} />
                    İş Türü Dağılımı ({overviewPeriod === 'aylik' ? 'Bu Ay' : 'Bu Yıl'})
                </h3>

                {topCategories.length > 0 ? (
                    <>
                        {/* Dagilim Ilerleme Cubugu */}
                        <div className="w-full h-4 rounded-full flex overflow-hidden mb-6 bg-gray-100">
                            {topCategories.map(([category, count]: any, idx: number) => {
                                const pct = (count / periodEvents.length) * 100;
                                const style = getEventStyle(category);
                                return (
                                    <div
                                        key={category}
                                        title={`${category.toUpperCase()} (${count})`}
                                        className="h-full transition-all duration-500 hover:brightness-110"
                                        style={{ width: `${pct}%`, backgroundColor: style.hex }}
                                    />
                                );
                            })}
                        </div>

                        {/* Aciklama Izgarasi */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {topCategories.map(([category, count]: any) => {
                                const pct = ((count / periodEvents.length) * 100).toFixed(1);
                                const style = getEventStyle(category);
                                return (
                                    <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-indigo-100 transition-all">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${style.dot}`}></span>
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">{category}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-sm font-black text-gray-900">{count}</span>
                                            <span className="block text-[9px] text-gray-400 font-bold">%{pct}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 opacity-60">
                        <BarChart3 className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm font-bold text-gray-500">Seçili dönemde kayıtlı organizasyon yok.</p>
                    </div>
                )}
            </div>

        </div>
    );
};
