import { serializeJsonLd } from "@/lib/seo/json-ld";

/** Sunucuda render edilen JSON-LD (SSR HTML'de bulunur, istemci JS'ine bağlı değil). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
