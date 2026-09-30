/**
 * Geçici marka görselleri (logo tasarımı tamamlanana kadar):
 *   public/og/bifire-og.png  (1200×630 varsayılan paylaşım görseli)
 *   src/app/icon.png         (512×512 favicon)
 *   src/app/apple-icon.png   (180×180)
 * Kullanım: npx tsx scripts/generate-brand-assets.ts
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="115%" r="75%">
      <stop offset="0" stop-color="#e0691f" stop-opacity="0.75"/>
      <stop offset="0.45" stop-color="#e0691f" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#0c0c0d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0c0c0d"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#ffffff" stroke-opacity="0.05">
    ${Array.from({ length: 10 }, (_, i) => `<line x1="${(i + 1) * 120}" y1="0" x2="${(i + 1) * 120}" y2="630"/>`).join("")}
  </g>
  <text x="619" y="300" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="112" font-weight="600" letter-spacing="38" fill="#f4f1ec">BİFİRE</text>
  <rect x="570" y="336" width="60" height="4" fill="#e0691f"/>
  <text x="600" y="410" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="30" letter-spacing="8" fill="#e8a868">MODERN ŞÖMİNE SİSTEMLERİ</text>
</svg>`;

const icon = (size: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0c0c0d"/>
  <text x="256" y="330" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="300" font-weight="700" fill="#f4f1ec">B</text>
  <rect x="176" y="380" width="160" height="18" fill="#e0691f"/>
</svg>`;

async function main() {
  await mkdir(path.join(root, "public", "og"), { recursive: true });
  await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(path.join(root, "public", "og", "bifire-og.png"));
  await sharp(Buffer.from(icon(512))).png().toFile(path.join(root, "src", "app", "icon.png"));
  await sharp(Buffer.from(icon(180))).resize(180, 180).png().toFile(path.join(root, "src", "app", "apple-icon.png"));
  console.log("Marka görselleri üretildi.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
