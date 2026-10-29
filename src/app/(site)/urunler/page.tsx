import { permanentRedirect } from "next/navigation";
import { routes } from "@/lib/catalog";

/** Koleksiyonlar sayfası /somine-modelleri adresine taşındı; eski /urunler adresi kalıcı yönlenir. */
export default function LegacyProductsPage() {
  permanentRedirect(routes.products);
}
