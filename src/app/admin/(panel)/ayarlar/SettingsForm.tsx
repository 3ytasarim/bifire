"use client";

import type { SiteSetting } from "@prisma/client";
import { AdminForm, SaveBar } from "@/components/admin/AdminForm";
import { Section, TextArea, TextInput } from "@/components/admin/fields";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { VideoPicker } from "@/components/admin/VideoPicker";
import { saveSettings } from "./actions";

export function SettingsForm({ s }: { s: Omit<SiteSetting, "updatedAt"> }) {
  return (
    <AdminForm action={saveSettings}>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Section title="Marka">
            <TextInput name="companyName" label="Firma adı" required defaultValue={s.companyName} maxLength={120} />
            <div className="grid gap-6 sm:grid-cols-2">
              <ImagePicker name="logoUrl" label="Logo" defaultValue={s.logoUrl} aspect="aspect-[3/1]" hint="Koyu zemin üzerinde görünür (açık renkli logo). Boşsa “BİFİRE” yazısı gösterilir." nameHint="bifire logo" />
              <ImagePicker name="faviconUrl" label="Favicon" defaultValue={s.faviconUrl} aspect="aspect-square max-w-32" hint="Kare, en az 512×512 PNG." nameHint="bifire favicon" />
            </div>
            <TextArea name="footerDescription" label="Footer açıklaması" rows={3} maxLength={500} defaultValue={s.footerDescription ?? ""} hint="Footer'da ve Organization şemasında marka açıklaması olarak kullanılır." />
            <ImagePicker name="defaultOgImage" label="Varsayılan paylaşım görseli (OG)" defaultValue={s.defaultOgImage} aspect="aspect-[1200/630]" hint="Kendi görseli olmayan sayfalarda kullanılır. 1200×630 önerilir." nameHint="bifire paylasim" />
          </Section>
          <Section title="Ana sayfa görselleri">
            <ImagePicker name="aboutImage" label="“Bifire” manifesto görseli" defaultValue={s.aboutImage} altName="aboutImageAlt" altDefault={s.aboutImageAlt} aspect="aspect-[4/5] max-w-xs" nameHint="bifire somine yasam alani" />
            <TextArea
              name="aboutImageCaption"
              label="Görsel açıklaması (görselin altında görünür)"
              rows={2}
              maxLength={300}
              defaultValue={s.aboutImageCaption ?? ""}
              hint="İlk satır başlık olarak gösterilir (ör. ürün adı), sonraki satır kısa açıklama. Boşsa açıklama gösterilmez."
            />
            <VideoPicker
              name="aboutVideo"
              label="Manifesto videosu (opsiyonel)"
              defaultValue={s.aboutVideo}
              aspect="aspect-[4/5] max-w-xs"
              hint="Görselin yerinde sessiz ve sürekli döngüde oynar; bölüm ekrana gelince yüklenir. Görsel, video yüklenene kadar kapak olarak görünür ve alt metni SEO için kullanılır. Dikey (4:5 veya 9:16) video önerilir."
            />
            <ImagePicker name="featureImage" label="“Mimari ateş çözümleri” büyük görseli" defaultValue={s.featureImage} altName="featureImageAlt" altDefault={s.featureImageAlt} aspect="aspect-[21/9]" nameHint="mimari somine" />
            <VideoPicker
              name="featureVideo"
              label="“Mimari ateş çözümleri” videosu (opsiyonel)"
              defaultValue={s.featureVideo}
              aspect="aspect-video max-w-md"
              hint="Görselin yerinde sessiz ve sürekli döngüde oynar; bölüm ekrana gelince yüklenir. Görsel kapak ve SEO alt metni olarak kalır. Yatay 16:9 video önerilir (ör. 1920×1080); masaüstünde kırpılmadan tam gösterilir."
            />
            <ImagePicker
              name="showroomImage"
              label="Fabrika showroom görseli"
              defaultValue={s.showroomImage}
              altName="showroomImageAlt"
              altDefault={s.showroomImageAlt}
              aspect="aspect-[4/3] max-w-sm"
              hint="Fabrika showroom sayfası ve sitedeki showroom bölümlerinde kullanılır. Gerçek showroom fotoğrafı önerilir; boşsa manifesto görseli gösterilir."
              nameHint="bifire tuzla fabrika showroom"
            />
          </Section>
        </div>
        <div className="space-y-6">
          <Section title="İletişim">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput name="phone" label="Telefon" type="tel" defaultValue={s.phone ?? ""} maxLength={40} />
              <TextInput name="email" label="E-posta" type="email" defaultValue={s.email ?? ""} maxLength={160} />
            </div>
            <TextArea name="address" label="Adres" rows={2} maxLength={400} defaultValue={s.address ?? ""} />
            <TextInput name="workingHours" label="Çalışma saatleri" placeholder="Hafta içi 09:00–18:00" defaultValue={s.workingHours ?? ""} maxLength={160} />
            <TextInput name="mapsUrl" label="Google Maps bağlantısı" placeholder="https://maps.app.goo.gl/…" defaultValue={s.mapsUrl ?? ""} maxLength={500} />
            <TextInput name="mapsEmbedUrl" label="Google Maps embed adresi" placeholder="https://www.google.com/maps/embed?pb=…" defaultValue={s.mapsEmbedUrl ?? ""} maxLength={500} hint="Google Maps › Paylaş › Harita yerleştir › iframe'deki src adresi. İletişim sayfasında harita olarak gösterilir." />
          </Section>
          <Section title="WhatsApp">
            <TextInput name="whatsapp" label="WhatsApp numarası" placeholder="+90 5xx xxx xx xx" defaultValue={s.whatsapp ?? ""} maxLength={40} hint="Boşsa WhatsApp butonları gösterilmez." />
            <TextArea name="whatsappMessage" label="Hazır mesaj" rows={2} maxLength={300} defaultValue={s.whatsappMessage ?? ""} hint="Ürün sayfasından yazılırsa ürün adı ve adresi mesaja eklenir." />
          </Section>
          <Section title="Sosyal medya">
            <TextInput name="instagramUrl" label="Instagram" placeholder="https://instagram.com/…" defaultValue={s.instagramUrl ?? ""} maxLength={500} />
            <TextInput name="facebookUrl" label="Facebook" placeholder="https://facebook.com/…" defaultValue={s.facebookUrl ?? ""} maxLength={500} />
            <TextInput name="youtubeUrl" label="YouTube" placeholder="https://youtube.com/@…" defaultValue={s.youtubeUrl ?? ""} maxLength={500} />
            <TextInput name="linkedinUrl" label="LinkedIn" placeholder="https://linkedin.com/company/…" defaultValue={s.linkedinUrl ?? ""} maxLength={500} />
            <TextInput name="pinterestUrl" label="Pinterest" placeholder="https://pinterest.com/…" defaultValue={s.pinterestUrl ?? ""} maxLength={500} />
          </Section>
        </div>
      </div>
      <SaveBar />
    </AdminForm>
  );
}
