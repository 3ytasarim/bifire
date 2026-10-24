# Bifire CRM

Admin paneli › **CRM**. Müşteri talepleri ilk temastan montaja kadar tek yerde izlenir.

## Yapı

| Kayıt | Açıklama |
|---|---|
| Müşteri (`CrmCustomer`, BF-0001) | Ad, telefon, e-posta, il/ilçe, ilk kanal. Telefon (son 10 hane) ve e-posta anahtarıyla eşleştirilir. |
| Proje (`CrmProject`, P-0001) | Müşterinin her işi ayrı proje: ürün/şömine türü, uygulama yeri, aşama, sorumlu, sonraki takip, girilen teklif tutarı, kullanım amacı, baca durumu, notlar. |
| Görüşme (`CrmActivity`) | Not, telefon, showroom/keşif, mesaj; aşama/sorumlu değişiklikleri ve web talepleri otomatik yazılır. |
| Görev (`CrmTask`) | Başlık, tarih, sorumlu, tamamlandı. Projeye bağlı veya projesiz. |
| Hazır mesaj (`CrmMessageTemplate`) | `[Ad]` otomatik doldurulur; kopyala veya WhatsApp'ta aç. **Otomatik gönderim yok.** |

Aşamalar: Yeni talep → Showroom / Keşif → Teklif / Karar → Sipariş / Uygulama → Tamamlandı / Kaybedildi.

## Talebin CRM'e gelişi

- **Web formları** (teklif, showroom randevusu, iletişim, mekâna özel tasarım): form kaydedilince `lib/crm/intake.ts` müşteriyi eşleştirir (yoksa oluşturur), müşterinin son 120 gün içinde güncellenmiş açık projesi varsa talebi ona ekler, yoksa “Yeni talep” projesi açar; 24 saat sonrasına **ilk dönüş görevi** ve takip tarihi koyar. CRM aktarımı hata verse de form kaydı bozulmaz; Talepler ekranında “CRM'e aktar” düğmesi vardır.
- **Elle giriş** (telefon, showroom ziyareti, referans, Instagram/Facebook/WhatsApp mesajı): CRM › Müşteriler › Yeni müşteri. Telefon/e-posta girilince eşleşen müşteriler gösterilir; mevcut müşteriye proje eklenir ya da bilerek yeni müşteri açılır.
- **Dış kanallar**: `POST /api/v1/crm/leads` — `Authorization: Bearer <CRM_INTAKE_TOKEN>`; gövde `{ name, phone?, email?, district?, source?, product?, message?, campaign? }` (telefon veya e-posta zorunlu). Meta reklam formları Zapier/Make veya Meta webhook köprüsüyle buraya bağlanabilir. `.env` içinde anahtar yoksa uç nokta kapalıdır.

## Bildirimler

- Menüde **Görevler** yanında kırmızı rozet: tarihi geçmiş açık görev + takip tarihi geçmiş açık proje sayısı.
- Genel bakış: bugünkü/geciken takipler, sorumlusuz projeler, yaklaşan işler.
- E-posta/WhatsApp ile ekip bildirimi için SMTP veya WhatsApp Business Platform hesabı gerekir (henüz yok).

## Sonraki adımlar (hesap/izin gerektirir)

1. Meta Lead Ads → doğrudan webhook (Meta uygulaması, sayfa erişim anahtarı, uygulama incelemesi).
2. WhatsApp Business Platform ve Instagram mesajları (Meta Business doğrulaması, numara, şablon onayı).
3. Ekip bildirim e-postaları (SMTP hesabı) — günlük “geciken işler” özeti.
4. Roller: satış / uygulama ekibi için görünürlük sınırları (şu an tüm panel kullanıcıları CRM'i kullanır; hazır mesaj silme yönetici yetkisindedir).

Müşteriye otomatik mesaj gönderimi kayıt ve ekip bildirimlerinden ayrı tutulur; teknik uygunluk, kesin fiyat ve montaj tarihi ekip onayıyla paylaşılır.
