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
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Yükleme limitleri (lib/upload.ts): görsel 10 MB, PDF 20 MB; multipart ek yükü için pay bırakıldı.
    serverActions: { bodySizeLimit: "24mb" },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
