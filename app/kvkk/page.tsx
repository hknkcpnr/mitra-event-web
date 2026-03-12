import React from 'react';
import { prisma } from '@/lib/prisma';
import KVKKContent from './KVKKContent';

async function getContent() {
    try {
        const contentRecord = await prisma.content.findUnique({
            where: { key: 'site_content' }
        });
        if (contentRecord) {
            return JSON.parse(contentRecord.value);
        }
    } catch (e) {
        console.error('Failed to parse site content from DB:', e);
    }
    return {};
}

export default async function KVKKPage() {
    const siteData = await getContent();

    return <KVKKContent siteData={siteData} />;
}
