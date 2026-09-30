import type { Metadata } from "next";
import { JsonLd } from "./JsonLd";
import { PageHero } from "./PageHero";
import { LEGAL } from "@/content/legal";
import { getSiteSettings } from "@/lib/settings";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type Key = keyof typeof LEGAL;

async function fill(text: string) {
  const s = await getSiteSettings();
  return text
    .replaceAll("{firma}", s.companyName)
    .replaceAll("{eposta}", s.email || "iletişim sayfamızdaki kanallar")
    .replaceAll("{adres}", s.address || "");
}

export function legalMetadata(key: Key, path: string): Promise<Metadata> {
  const doc = LEGAL[key];
  return buildMetadata({ title: `${doc.title} | Bifire`, description: doc.intro.replace("{firma}", "Bifire").slice(0, 155), path });
}

export async function LegalPage({ docKey, path }: { docKey: Key; path: string }) {
  const doc = LEGAL[docKey];
  const crumbs = [
    { name: "Ana Sayfa", path: "/" },
    { name: doc.title, path },
  ];
  const intro = await fill(doc.intro);
  const sections = await Promise.all(doc.sections.map(async (s) => ({ heading: s.heading, body: await Promise.all(s.body.map(fill)) })));

  return (
    <>
      <JsonLd data={graph(webPageNode({ path, name: doc.title, hasBreadcrumb: true }), breadcrumbNode(path, crumbs))} />
      <PageHero crumbs={crumbs} title={doc.title} />
      <section className="bg-paper py-16 sm:py-24">
        <div className="shell max-w-3xl">
          <div className="prose prose-lg rich">
            <p>{intro}</p>
            {sections.map((s) => (
              <div key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
