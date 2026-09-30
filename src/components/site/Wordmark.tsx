import Image from "next/image";

/**
 * Marka işareti. Logo tasarımı tamamlanınca Admin > Site Ayarları'ndan yüklenen logo (logoUrl)
 * otomatik kullanılır; o zamana kadar tipografik "BİFİRE" yazısı gösterilir.
 */
export function Wordmark({
  logoUrl,
  name = "Bifire",
  tone = "light",
  size = "md",
}: {
  logoUrl?: string | null;
  name?: string;
  tone?: "light" | "dark";
  size?: "md" | "lg";
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={240}
        height={80}
        priority
        sizes="160px"
        className={size === "lg" ? "h-12 w-auto" : "h-9 w-auto lg:h-10"}
      />
    );
  }
  return (
    <span className={`inline-flex flex-col items-center leading-none ${tone === "light" ? "text-bone" : "text-ink"}`}>
      <span
        className={`font-display font-semibold tracking-[0.34em] ${size === "lg" ? "text-3xl" : "text-[1.35rem] lg:text-[1.55rem]"}`}
        style={{ marginRight: "-0.34em" }}
      >
        BİFİRE
      </span>
      <span aria-hidden="true" className="mt-1.5 block h-[2px] w-7 bg-ember" />
    </span>
  );
}
