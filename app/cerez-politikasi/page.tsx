import React from 'react';
import fs from 'fs';
import path from 'path';
import CookieContent from './CookieContent';

async function getContent() {
    const filePath = path.join(process.cwd(), 'data', 'content.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
}

export default async function CookiePage() {
    const siteData = await getContent();

    return <CookieContent siteData={siteData} />;
}
