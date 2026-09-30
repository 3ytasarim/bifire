import "server-only";
import { revalidatePath } from "next/cache";

/**
 * İçerik değiştiğinde tüm public ISR sayfalarını (ana sayfa, listeler, detaylar, sitemap, llms.txt) tazeler.
 * İçerik sayısı küçük olduğundan seçici invalidation yerine güvenli ve basit tam yenileme tercih edildi.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
