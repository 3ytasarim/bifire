import type { NextConfig } from "next";

/**
 * Temel güvenlik başlıkları. CSP bilinçli olarak eklenmedi: inline JSON-LD ve Next runtime script'leri
 * için nonce tabanlı bir politika ayrıca tasarlanıp test edilmeli.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // canonical/description/OG etiketleri tüm istemcilere (AI tarayıcıları dahil) <head> içinde gelsin.
  htmlLimitedBots: /.*/,
  // Yalnızca `next dev`: Cloudflare quick tunnel (*.trycloudflare.com) üzerinden önizlemeye izin ver.
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Yükleme limitleri (lib/upload.ts): görsel 10 MB, PDF 20 MB, video 40 MB; multipart ek yükü için pay bırakıldı.
    serverActions: { bodySizeLimit: "48mb" },
  },
  // Rehber /blog → /somine-rehberi taşındı (kalıcı yönlendirme; eski bağlantılar ve dış linkler korunur).
  async redirects() {
    // Yayından kalkan eski rehber yazıları → aynı konudaki güncel rehber (zincir olmasın diye /blog/ biçimi de doğrudan).
    const retired: [string, string][] = [
      ["somine-kaplama-malzemeleri", "somine-kaplamasi-secimi"],
      ["somine-bakimi-ve-guvenli-kullanim", "somine-bakimi-neleri-kapsar"],
      ["kose-somine-nedir", "kose-somine-cam-birlesimi-ve-gorus-acisi-rehberi"],
      ["uc-tarafli-ve-tunel-somineler", "cift-yonlu-somine"],
    ];
    return [
      ...retired.flatMap(([from, to]) =>
        ["/blog/", "/somine-rehberi/"].map((base) => ({ source: `${base}${from}`, destination: `/somine-rehberi/${to}`, permanent: true })),
      ),
      { source: "/blog", destination: "/somine-rehberi", permanent: true },
      { source: "/blog/:path*", destination: "/somine-rehberi/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
