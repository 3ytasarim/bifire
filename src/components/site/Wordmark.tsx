import Image from "next/image";

/** Varsayılan marka logosu (şeffaf PNG, 740×196): BI antrasit, FIRE bronz. */
const DEFAULT_LOGO = "/brand/bifire-logo.png";

/**
 * Marka işareti. Admin > Site Ayarları'ndan logo yüklenirse (logoUrl) o kullanılır, yoksa varsayılan logo.
 * Genişlik: header 184px masaüstü / 160px mobil, footer 168px / 144px.
 * Koyu zeminde (tone="light") logo tek renk açık tona çevrilir.
 */
export function Wordmark({
  logoUrl,
  name = "Bifire",
  tone = "dark",
  size = "md",
}: {
  logoUrl?: string | null;
  name?: string;
  tone?: "light" | "dark";
  size?: "md" | "footer";
}) {
  return (
    <Image
      src={logoUrl || DEFAULT_LOGO}
      alt={name}
      width={740}
      height={196}
      priority={size === "md"}
      sizes="(min-width: 1024px) 184px, 160px"
      className={`h-auto ${size === "footer" ? "w-[144px] lg:w-[168px]" : "w-[160px] lg:w-[184px]"} ${tone === "light" ? "brightness-0 invert" : ""}`}
    />
  );
}
