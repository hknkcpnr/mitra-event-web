'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ziyaretçi ve Sayfa Görüntüleme Takip Bileşeni (Client-side)
 * Sayfa değişimlerini algılar ve istatistik API'sine veri gönderir.
 * Admin paneli trafiğini istatistiklere dahil etmez.
 */
export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Admin sayfalarını takip etme
        if (pathname && pathname.startsWith('/admin')) return;

        // Ziyaretçi takibi (Session bazlı - Tarayıcı kapatılana kadar 1 kez sayılır)
        const isNewVisit = !sessionStorage.getItem('visited');

        const track = async () => {
            try {
                // Sadece yeni ziyaretse 'visit' gönder, değilse sadece 'pageview'
                await fetch('/api/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: isNewVisit ? 'visit' : 'pageview',
                        path: pathname
                    }),
                });

                if (isNewVisit) {
                    sessionStorage.setItem('visited', 'true');
                }
            } catch (error) {
                console.error('Analytics error:', error);
            }
        };

        track();
    }, [pathname]); // Her sayfa değişiminde çalışır

    return null; // Görünmez bileşen
}
