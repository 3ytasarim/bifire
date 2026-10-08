/**
 * Site bölümlerini geçici olarak askıya alma anahtarları.
 * `projects: false` → menü/footer bağlantıları, ana sayfa ve ürün sayfası proje blokları, sitemap ve llms.txt
 * kayıtları gizlenir; /projeler ve /projeler/[slug] 404 döner. Admin paneldeki proje yönetimi çalışmaya devam eder
 * (içerik hazırlanabilir); yeniden yayına almak için `true` yapmak yeterlidir.
 */
export const FEATURES = {
  projects: false,
} as const;
