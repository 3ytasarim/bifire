# Bifire — Premium Şömine Sitesi + CMS

Bifire için ürün kataloğu, proje/referans, blog, slider, teklif/iletişim talepleri ve SEO yönetimi olan
kurumsal web platformu. Public site sunucu tarafında render edilir (SSR/ISR); tüm içerik `/admin` panelinden yönetilir.

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript (strict) |
| Stil | Tailwind CSS v4 (+ typography), `next/font` ile self-host Manrope + Inter |
| Veritabanı | Neon PostgreSQL, Prisma 7 (`@prisma/adapter-pg`, `prisma-client-js` generator) |
| Kimlik doğrulama | DB oturumu (httpOnly çerez, token SHA-256 özeti), Argon2id şifre, rol: EDITOR / ADMIN / SUPERADMIN |
| Editör | Tiptap v3 + sunucu tarafı `sanitize-html` |
| Yükleme | Merkezi depolama (`src/lib/storage`), yerel disk → `/uploads/...`; Media tablosunda gerçek genişlik/yükseklik |
| Doğrulama | Zod 4 (tüm server action'larda) |

Mimari kaynakları: header/hero mantığı Norm Yacht'tan (SYMC/Mezbaha Next.js uyarlamaları üzerinden), SEO mimarisi
(metadata, `@id` bağlı JSON-LD, image SEO, sitemap/robots) Mezbaha Teknolojileri'nden uyarlanmıştır.

## Gereksinimler

- Node.js 22+ (geliştirmede 24 ile test edildi), npm 10+
- Neon PostgreSQL veritabanı

## Kurulum

```bash
npm install                     # postinstall → prisma generate
cp .env.example .env            # değerleri doldurun (gerçek bilgiler asla commit edilmez)
npm run db:deploy               # migration'ları uygular (mevcut veriyi silmez)
npm run admin:create            # ilk SUPERADMIN (.env: ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD, şifre ≥ 10 karakter)
npm run dev                     # http://localhost:3000
```

`admin:create` kullanıcı zaten varsa dokunmaz; şifreyi sıfırlamak için `npm run admin:create -- --reset`.
Kurulumdan sonra `ADMIN_SEED_PASSWORD`'ü `.env`'den silin ve panelde **Profilim**'den şifrenizi değiştirin.

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | ✓ | Neon pooled bağlantı (uygulama) |
| `DIRECT_URL` | ✓ | Neon direct bağlantı (Prisma migration) |
| `NEXT_PUBLIC_SITE_URL` | ✓ (prod) | Kanonik adres, production'da `https://` zorunlu — yoksa build bilinçli olarak durur |
| `UPLOAD_DIR` | – | Yükleme klasörü (varsayılan `./storage/uploads`) |
| `IP_HASH_SALT` | ✓ (prod) | Rate limit IP özeti tuzu |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | – | Yalnızca `admin:create` için |

Veritabanı bilgileri yalnızca sunucu tarafında kullanılır; `NEXT_PUBLIC_` önekli tek değişken site adresidir.

## Prisma komutları

```bash
npm run db:generate   # Prisma Client üret
npm run db:migrate    # (geliştirme) şema değişikliğinden yeni migration oluştur + uygula
npm run db:deploy     # (production) bekleyen migration'ları uygula
npm run db:studio     # veritabanı arayüzü
```

`prisma migrate reset` veritabanındaki TÜM veriyi siler — canlı veritabanında kullanmayın.

## Geliştirme / kontrol

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Production (Hetzner)

```bash
npm ci
npm run db:deploy
npm run build          # NEXT_PUBLIC_SITE_URL=https://www.bifiresomine.com olmalı
npm run start          # varsayılan port 3000 — nginx reverse proxy arkasında çalıştırın
```

- `storage/uploads` (veya `UPLOAD_DIR`) kalıcı diskte olmalı ve deploy'larda silinmemeli; yedeklemeye dahil edin.
- nginx: `client_max_body_size 24m;` (görsel 10 MB, PDF 20 MB), `X-Real-IP` / `X-Forwarded-For` başlıklarını iletin.
- Süreç yöneticisi (pm2/systemd) ile çalıştırın.

## Yönetim paneli (`/admin`)

Panel · Talepler · Ürünler · Kategoriler (2 seviye) · Etiketler · Slider · Projeler · Blog · Medya · SEO (statik sayfalar +
yönlendirmeler) · Site ayarları · Kullanıcılar · Profilim.

- Slug addan otomatik üretilir (Türkçe karakter dönüşümü), elle değiştirilebilir; yayındaki içeriğin slug'ı değişirse eski
  adresten yeniye otomatik **301** açılır.
- Kategori silme, içinde ürün veya alt kategori varsa engellenir (ürünler asla kaskadla silinmez).
- Kullanımdaki görsel medya kütüphanesinden silinemez.
- Kaydedilmemiş değişiklik varken sayfadan çıkışta uyarı verilir.

## SEO

- Her public sayfa sunucu tarafında `title`, `description`, `keywords`, self `canonical` (sorgu parametresiz), `robots`,
  OpenGraph (gerçek görsel ölçüsü/tipi) ve Twitter `summary_large_image` üretir.
- Manuel SEO alanları boşsa otomatik: `{Ad} | Bifire` ve içerikten türetilen açıklama.
- JSON-LD graph: Organization ↔ WebSite ↔ WebPage/CollectionPage/ItemPage ↔ BreadcrumbList / Product / BlogPosting /
  ImageObject, tutarlı `@id`'lerle. Fiyat, stok, puan, yorum **üretilmez** (veri yoksa alan yok).
- `sitemap.xml` yalnızca aktif/yayında/indexlenebilir içerik, gerçek `updatedAt`, görseller dahil. `robots.txt` `/admin` ve
  `/api` kapalı. `llms.txt` AI asistanları için site özeti.
- Silinmiş/pasif içerik gerçek HTTP 404 döner.

## Demo verisi

Test sırasında oluşturulan içeriklerin hepsi **DEMO** ile işaretlidir.

```bash
npm run demo:clear            # neyin silineceğini listeler
npm run demo:clear -- --yes   # DEMO kayıtlarını ve kullandıkları dosyaları siler
```

## Yayın öncesi yapılacaklar

- [ ] Gerçek logo → Site ayarları › Logo (şimdilik "BİFİRE" yazısı gösterilir) ve `npm run brand:assets` ile üretilen geçici OG/favicon'u değiştirin
- [ ] Site ayarları: telefon, WhatsApp, e-posta, adres, harita, sosyal medya
- [ ] Yasal metinler (`src/content/legal.ts`): KVKK / gizlilik / çerez metinleri genel şablondur — hukuk danışmanı onayı gerekir
- [ ] `npm run demo:clear -- --yes` ile demo içerikleri kaldırın
- [ ] Google Search Console + sitemap gönderimi
- [ ] İsteğe bağlı: Content-Security-Policy (nonce tabanlı) — şu an temel güvenlik başlıkları aktif, CSP yok
