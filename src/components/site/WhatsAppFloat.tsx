import { getSiteSettings, whatsappHref } from "@/lib/settings";
import { WhatsappIcon } from "./Icons";

/** Sabit WhatsApp butonu (JS yok), sitenin metalik bronz düğme tonunda. Numara Site Ayarları'nda yoksa hiç render edilmez. */
export async function WhatsAppFloat() {
  const href = whatsappHref(await getSiteSettings());
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden yazın"
      className="wa-float fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center bronze-metal rounded-full border border-[#7a5a3a] text-[#fbfaf7] shadow-[0_12px_32px_rgb(74_54_34/0.4)] transition-[transform,bottom] duration-300 hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
