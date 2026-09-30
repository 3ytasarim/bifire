/**
 * Yasal metin şablonları. ÖNEMLİ: Bunlar genel çerçeve metinleridir; yayından önce firma unvanı,
 * VERBİS/veri sorumlusu bilgileri ve gerçek veri işleme süreçleriyle hukuk danışmanı tarafından
 * gözden geçirilmelidir. {firma}, {eposta}, {adres} alanları Site Ayarları'ndan doldurulur.
 */
export type LegalDoc = { title: string; intro: string; sections: { heading: string; body: string[] }[] };

export const LEGAL: Record<"kvkk" | "gizlilik" | "cerez", LegalDoc> = {
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    intro:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla {firma} olarak, kişisel verilerinizin hangi amaçlarla işlendiğini aşağıda bilginize sunarız.",
    sections: [
      {
        heading: "İşlenen kişisel veriler",
        body: ["İletişim ve teklif formları aracılığıyla ilettiğiniz ad soyad, telefon, e-posta adresi, ilgilendiğiniz ürün/kategori ve mesaj içeriği."],
      },
      {
        heading: "İşleme amaçları",
        body: ["Talebinizin yanıtlanması, teklif hazırlanması, keşif ve uygulama süreçlerinin planlanması ile yasal yükümlülüklerin yerine getirilmesi."],
      },
      {
        heading: "Hukuki sebep ve toplama yöntemi",
        body: [
          "Verileriniz, internet sitemizdeki formlar aracılığıyla elektronik ortamda; KVKK m.5/2-c (bir sözleşmenin kurulması veya ifası) ve açık rızanız hukuki sebeplerine dayanılarak toplanır.",
        ],
      },
      {
        heading: "Aktarım",
        body: ["Kişisel verileriniz, yalnızca hizmetin gerektirdiği ölçüde ve mevzuata uygun olarak barındırma/altyapı hizmet sağlayıcılarıyla paylaşılabilir; pazarlama amacıyla üçüncü kişilere aktarılmaz."],
      },
      {
        heading: "Haklarınız",
        body: [
          "KVKK m.11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.",
          "Başvurularınızı {eposta} adresine iletebilirsiniz.",
        ],
      },
    ],
  },
  gizlilik: {
    title: "Gizlilik Politikası",
    intro: "{firma} olarak ziyaretçilerimizin gizliliğine önem veriyoruz. Bu politika, internet sitemizi kullanırken hangi bilgilerin toplandığını ve nasıl korunduğunu açıklar.",
    sections: [
      { heading: "Toplanan bilgiler", body: ["Yalnızca formlarda kendi isteğinizle paylaştığınız bilgiler ve sitenin çalışması için gerekli teknik kayıtlar (ör. güvenlik amaçlı anonimleştirilmiş istek bilgileri)."] },
      { heading: "Bilgilerin kullanımı", body: ["Paylaştığınız bilgiler talebinizi yanıtlamak için kullanılır; izniniz olmadan pazarlama iletişimi yapılmaz."] },
      { heading: "Güvenlik", body: ["Veriler şifreli bağlantı (HTTPS) üzerinden iletilir ve yetkisiz erişime karşı korunan sunucularda saklanır."] },
      { heading: "İletişim", body: ["Gizlilikle ilgili sorularınız için {eposta} adresine yazabilirsiniz."] },
    ],
  },
  cerez: {
    title: "Çerez Politikası",
    intro: "Bu politika, {firma} internet sitesinde kullanılan çerezleri açıklar.",
    sections: [
      {
        heading: "Zorunlu çerezler",
        body: ["Sitenin güvenli çalışması için gereken çerezlerdir. Ziyaretçi tarafında şu an yalnızca zorunlu çerezler kullanılmaktadır; yönetim paneli oturum çerezi yalnızca yetkili kullanıcılar içindir."],
      },
      {
        heading: "Analitik ve pazarlama çerezleri",
        body: ["Analitik veya pazarlama amaçlı çerezler eklenmesi durumunda, kullanılmadan önce açık onayınız alınacak ve bu politika güncellenecektir."],
      },
      { heading: "Çerezleri yönetme", body: ["Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz; zorunlu çerezlerin engellenmesi bazı işlevleri etkileyebilir."] },
    ],
  },
};
