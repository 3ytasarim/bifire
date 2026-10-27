import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { getSiteUrl, SITE_NAME } from "@/lib/seo/site";
import "./globals.css";

// next/font: fontlar build sırasında indirilip self-host edilir (Google'a çalışma zamanı isteği yok),
// size-adjust fallback ile CLS oluşmaz. latin-ext → Türkçe karakterler (ğ, ş, ı, İ).
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dmsans", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f0e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* JS çalışıyorsa işaretle: kaydırmayla beliren içerik yalnızca bu durumda gizli başlar (bkz. globals.css). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
