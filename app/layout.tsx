import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VisitorTracker from "./components/VisitorTracker";
import fs from "fs";
import path from "path";

function getMetaData() {
  try {
    const filePath = path.join(process.cwd(), "data", "content.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return data.meta || {};
  } catch {
    return {};
  }
}
export async function generateViewport() {
  const meta = getMetaData();
  return {
    themeColor: meta.themeColor || "#2D2926",
  };
}

export async function generateMetadata() {
  const meta = getMetaData();

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
