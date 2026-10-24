/**
 * Site bölümlerini geçici olarak askıya alma anahtarları.
 * `projects: false` → menü/footer bağlantıları, ana sayfa ve ürün sayfası proje blokları, sitemap ve llms.txt
 * kayıtları gizlenir; /projeler ve /projeler/[slug] 404 döner. Admin paneldeki proje yönetimi çalışmaya devam eder
 * (içerik hazırlanabilir); yeniden yayına almak için `true` yapmak yeterlidir.
 */
export const FEATURES = {
  projects: false,
  /** Ana sayfa "Seçilmiş modeller" bölümü (kullanıcı isteğiyle şimdilik gizli). */
  homeFeaturedProducts: false,
  /**
   * Admin › CRM (kullanıcı isteğiyle şimdilik gizli): menü, rozet, Talepler'deki CRM düğmeleri gizlenir ve /admin/crm
   * sayfaları 404 döner. Web formlarından CRM'e otomatik kayıt arka planda sürer (açılınca geçmiş talepler hazır olur).
   */
  crm: false,
} as const;
