import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { RevealObserver } from "@/components/site/RevealObserver";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { getSiteSettings } from "@/lib/settings";
import { getImageMeta } from "@/lib/seo/image-meta";
import { graph, organizationNode, websiteNode } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return s.faviconUrl ? { icons: { icon: s.faviconUrl, apple: s.faviconUrl } } : {};
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  const logoMeta = s.logoUrl ? await getImageMeta(s.logoUrl) : null;

  return (
    <>
      {/* Organization + WebSite: site genelinde TEK tanım; sayfa şemaları bunlara @id ile bağlanır. */}
      <JsonLd data={graph(organizationNode(s, s.logoUrl ? { url: s.logoUrl, meta: logoMeta } : undefined), websiteNode(s))} />
      <Header />
      <main id="icerik" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
      <RevealObserver />
    </>
  );
}
