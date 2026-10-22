import { getSiteSettings, whatsappHref } from "@/lib/settings";
import { WhatsappIcon } from "./Icons";

/** Sabit WhatsApp butonu (JS yok). Numara Site Ayarları'nda yoksa hiç render edilmez. */
export async function WhatsAppFloat() {
  const href = whatsappHref(await getSiteSettings());
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp üzerinden yazın"
      className="wa-float fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f7a4a] text-white shadow-[0_12px_32px_rgb(0_0_0/0.35)] transition-[transform,bottom] duration-300 hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
