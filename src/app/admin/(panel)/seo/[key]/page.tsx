import { notFound } from "next/navigation";
import { Flash, PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { isStaticPageKey, STATIC_PAGES } from "@/lib/seo/static-pages";
import { SeoPageForm } from "./SeoPageForm";

export const metadata = { title: "Sayfa SEO" };

export default async function SeoPageEdit({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ key }, { kaydedildi }] = await Promise.all([params, searchParams]);
  if (!isStaticPageKey(key)) notFound();
  const def = STATIC_PAGES[key];
  const row = await prisma.seoPage.findUnique({ where: { key } });
  return (
    <div>
      <PageHeader title={`SEO: ${def.label}`} description={def.path} back={{ label: "SEO", href: "/admin/seo" }} />
      <Flash message={kaydedildi ? "SEO ayarları kaydedildi." : null} />
      <SeoPageForm key={row?.updatedAt.toISOString() ?? "new"} pageKey={key} path={def.path} row={row} defaults={def.defaults} />
    </div>
  );
}
