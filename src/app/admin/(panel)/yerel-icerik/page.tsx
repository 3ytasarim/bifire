import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge, ListToolbar, PageHeader, Table } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { modelTargets, regionTargets, type LocalTarget } from "@/lib/local-content-catalog";

export const metadata = { title: "Yerel İçerik" };

const trLower = (s: string) => s.toLocaleLowerCase("tr");

/**
 * Model ve hizmet bölgesi sayfalarına özel içerik. Ortak şablon (aile metni, form, showroom) değişmez;
 * buradan girilen açıklama, not ve gerçek fotoğraflar yalnız ilgili sayfada görünür.
 */
export default async function LocalContentAdmin({ searchParams }: { searchParams: Promise<{ q?: string; tur?: string; durum?: string }> }) {
  const { q = "", tur = "bolge", durum = "" } = await searchParams;
  const [rows, targets] = await Promise.all([
    prisma.localContent.findMany({ select: { key: true, updatedAt: true, intro: true, image: true } }),
    tur === "model" ? modelTargets() : Promise.resolve(regionTargets()),
  ]);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const needle = trLower(q.trim());
  const list = targets
    .filter((t) => !needle || trLower(`${t.label} ${t.group}`).includes(needle))
    .filter((t) => (durum === "dolu" ? byKey.has(t.key) : durum === "bos" ? !byKey.has(t.key) : durum === "oncelikli" ? t.priority : true))
    .sort((a, b) => Number(b.priority) - Number(a.priority));
  const filled = targets.filter((t) => byKey.has(t.key)).length;
  const tab = (value: string, label: string) => (
    <Link href={`/admin/yerel-icerik?tur=${value}`} aria-current={tur === value ? "page" : undefined} className={`inline-flex min-h-10 items-center border px-4 text-sm font-semibold ${tur === value ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-ink hover:border-ink"}`}>
      {label}
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Yerel İçerik"
        description="Model ve hizmet bölgesi sayfalarına özel açıklama, not ve gerçek fotoğraf. Ortak şablon olduğu gibi kalır; girilen içerik yalnız o sayfada görünür ve sayfayı diğerlerinden ayırır."
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tab("bolge", "Hizmet bölgeleri")}
        {tab("model", "Model sayfaları")}
        <span className="ml-auto text-sm text-neutral-500">
          {filled} / {targets.length} sayfada özel içerik var
        </span>
      </div>
      <ListToolbar
        q={q}
        placeholder={tur === "model" ? "Model kodu veya ürün ara…" : "İl veya ilçe ara…"}
        filters={[
          { name: "tur", label: "Tür", value: tur, options: [{ value: "bolge", label: "Hizmet bölgeleri" }, { value: "model", label: "Model sayfaları" }] },
          { name: "durum", label: "Durum", value: durum, options: [{ value: "dolu", label: "Özel içerik var" }, { value: "bos", label: "Özel içerik yok" }, ...(tur === "bolge" ? [{ value: "oncelikli", label: "Öncelikli bölgeler" }] : [])] },
        ]}
      />
      <Table head={[tur === "model" ? "Model" : "Sayfa", tur === "model" ? "Ürün" : "İl", "Durum", ""]} empty={<p className="p-6 text-sm text-neutral-500">Eşleşen sayfa yok.</p>}>
        {list.map((t: LocalTarget) => {
          const row = byKey.get(t.key);
          return (
            <tr key={t.key} className="border-t border-neutral-200">
              <td className="px-4 py-3">
                <Link href={`/admin/yerel-icerik/duzenle?k=${encodeURIComponent(t.key)}`} className="font-semibold text-ink hover:underline">
                  {t.label}
                </Link>
                {t.priority ? (
                  <span className="ml-2">
                    <Badge tone="ember">Öncelikli</Badge>
                  </span>
                ) : null}
                {t.hint ? <p className="mt-0.5 text-xs text-neutral-500">{t.hint}</p> : null}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600">{t.group}</td>
              <td className="px-4 py-3">
                {row ? <Badge tone="green">{`Var${row.image ? " · fotoğraflı" : ""}`}</Badge> : <Badge>Ortak şablon</Badge>}
              </td>
              <td className="px-4 py-3 text-right">
                <a href={t.path} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-ink">
                  Sayfayı aç <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
