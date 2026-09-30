import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, PageHeader, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { STATIC_PAGE_KEYS, STATIC_PAGES } from "@/lib/seo/static-pages";

export const metadata = { title: "SEO" };

type Issue = { name: string; href: string; issues: string[] };

function check(title: string | null, desc: string | null): string[] {
  const out: string[] = [];
  if (!title) out.push("Meta başlık otomatik");
  else if (title.length > 60) out.push(`Başlık uzun (${title.length})`);
  if (!desc) out.push("Meta açıklama otomatik");
  else if (desc.length > 160) out.push(`Açıklama uzun (${desc.length})`);
  return out;
}

export default async function SeoAdminPage() {
  const [pages, products, categories, posts, projects, redirects] = await Promise.all([
    prisma.seoPage.findMany(),
    prisma.product.findMany({ where: { active: true }, select: { id: true, name: true, metaTitle: true, metaDescription: true, coverImage: true, coverImageAlt: true } }),
    prisma.productCategory.findMany({ where: { active: true }, select: { id: true, name: true, metaTitle: true, metaDescription: true } }),
    prisma.blogPost.findMany({ where: { published: true }, select: { id: true, title: true, metaTitle: true, metaDescription: true, coverImage: true, coverImageAlt: true } }),
    prisma.project.findMany({ where: { active: true }, select: { id: true, title: true, metaTitle: true, metaDescription: true } }),
    prisma.redirect.count({ where: { active: true } }),
  ]);
  const byKey = new Map(pages.map((p) => [p.key, p]));

  const audit: Issue[] = [
    ...products.map((p) => ({ name: `Ürün: ${p.name}`, href: `/admin/urunler/${p.id}`, issues: [...check(p.metaTitle, p.metaDescription), ...(p.coverImage && !p.coverImageAlt ? ["Kapak alt metni yok"] : []), ...(!p.coverImage ? ["Kapak görseli yok"] : [])] })),
    ...categories.map((c) => ({ name: `Kategori: ${c.name}`, href: `/admin/kategoriler/${c.id}`, issues: check(c.metaTitle, c.metaDescription) })),
    ...posts.map((p) => ({ name: `Blog: ${p.title}`, href: `/admin/blog/${p.id}`, issues: [...check(p.metaTitle, p.metaDescription), ...(p.coverImage && !p.coverImageAlt ? ["Kapak alt metni yok"] : [])] })),
    ...projects.map((p) => ({ name: `Proje: ${p.title}`, href: `/admin/projeler/${p.id}`, issues: check(p.metaTitle, p.metaDescription) })),
  ].filter((x) => x.issues.some((i) => !i.endsWith("otomatik")));

  return (
    <div>
      <PageHeader title="SEO" description="Statik sayfaların başlık, açıklama, paylaşım ve robots ayarları. Boş alanlar için güvenli otomatik değerler kullanılır." />
      <Table head={["Sayfa", "Adres", "Başlık", "Robots", ""]}>
        {STATIC_PAGE_KEYS.map((key) => {
          const row = byKey.get(key);
          const def = STATIC_PAGES[key];
          return (
            <tr key={key} className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium">
                <Link href={`/admin/seo/${key}`} className="hover:underline">
                  {def.label}
                </Link>
              </td>
              <td className="px-4 py-3 text-neutral-500">{def.path}</td>
              <td className="max-w-md px-4 py-3">
                <p className="truncate">{row?.title || def.defaults.title}</p>
                {!row?.title ? <p className="text-xs text-neutral-400">Otomatik</p> : null}
              </td>
              <td className="px-4 py-3">
                {row && !row.robotsIndex ? <Badge tone="red">noindex</Badge> : <Badge tone="green">index</Badge>} {row && !row.robotsFollow ? <Badge tone="amber">nofollow</Badge> : null}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/seo/${key}`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
                  Düzenle <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          );
        })}
      </Table>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="border border-neutral-200 bg-white p-5 xl:col-span-2">
          <h2 className="font-semibold">İçerik SEO denetimi</h2>
          <p className="mt-1 text-sm text-neutral-500">Uzun başlık/açıklama ve eksik görsel alt metinleri. (Boş meta alanları otomatik doldurulduğu için burada hata sayılmaz.)</p>
          {audit.length ? (
            <ul className="mt-4 divide-y divide-neutral-100">
              {audit.slice(0, 50).map((a) => (
                <li key={a.href} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                  <Link href={a.href} className="mr-auto font-medium hover:underline">
                    {a.name}
                  </Link>
                  {a.issues.filter((i) => !i.endsWith("otomatik")).map((i) => (
                    <Badge key={i} tone="amber">
                      {i}
                    </Badge>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-emerald-700">Sorun bulunamadı.</p>
          )}
        </section>
        <section className="border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Yönlendirmeler</h2>
          <p className="mt-1 text-sm text-neutral-500">{redirects} aktif 301/302 yönlendirme. Slug değişikliklerinde otomatik eklenir.</p>
          <Link href="/admin/seo/yonlendirmeler" className="mt-4 inline-flex min-h-10 items-center gap-2 bg-ink px-4 text-sm font-semibold text-white">
            Yönlendirmeleri yönet
          </Link>
          <div className="mt-6 space-y-1 text-sm">
            <a href="/sitemap.xml" target="_blank" className="block text-neutral-600 underline">sitemap.xml</a>
            <a href="/robots.txt" target="_blank" className="block text-neutral-600 underline">robots.txt</a>
            <a href="/llms.txt" target="_blank" className="block text-neutral-600 underline">llms.txt</a>
          </div>
        </section>
      </div>
    </div>
  );
}
