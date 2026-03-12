import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VisitorTracker from "./components/VisitorTracker";
import { prisma } from "@/lib/prisma";

/**
 * Veritabanından SEO ve Meta bilgilerini çeker.
 */
async function getMetaData() {
  try {
    const contentRecord = await prisma.content.findUnique({
      where: { key: "site_content" },
    });
    if (contentRecord) {
      const data = JSON.parse(contentRecord.value);
      return data.meta || {};
    }
  } catch (error) {
    console.error("Layout metadata error:", error);
  }
  return {};
}
/**
 * Tarayıcı tema rengini dinamik olarak ayarlar.
 */
export async function generateViewport() {
  const meta = await getMetaData();
  return {
    themeColor: meta.themeColor || "#2D2926",
  };
}

/**
 * Sitenin tüm SEO başlıklarını, açıklamalarını ve ikonlarını oluşturur.
 */
export async function generateMetadata() {
  const meta = await getMetaData();

  return {
    metadataBase: new URL("https://mitraevent.com"),
    title: meta.siteTitle || "Mitra Event",
    description: meta.siteDescription || "Organizasyon ve Etkinlik Yönetimi",
    keywords: meta.keywords || "",
    authors: meta.author ? [{ name: meta.author }] : undefined,
    openGraph: {
      title: meta.siteTitle || "Mitra Event",
      description: meta.siteDescription || "Organizasyon ve Etkinlik Yönetimi",
      images: meta.ogImage ? [{ url: meta.ogImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.siteTitle || "Mitra Event",
      description: meta.siteDescription || "Organizasyon ve Etkinlik Yönetimi",
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
    icons: {
      icon: meta.favicon || "/favicon.ico",
    },
  };
}

/**
 * Uygulamanın ana iskeletini (HTML/Body) ve global bileşenlerini (Tracker) tanımlar.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
