'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
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
