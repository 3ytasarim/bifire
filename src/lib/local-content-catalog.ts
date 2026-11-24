import "server-only";
import { PROVINCES } from "@/content/service-areas";
import { PRIORITY_DISTRICTS } from "@/content/regions";
import { MODEL_PAGES } from "@/content/model-pages";
import { routes } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { localKey } from "@/lib/local-content";
import { buildModels, modelPath } from "@/lib/models";

/** Admin > Yerel İçerik: düzenlenebilir sayfaların listesi (anahtar, ad, grup, site adresi). */
export type LocalTarget = { key: string; label: string; group: string; path: string; kind: "bolge" | "model"; priority: boolean; hint?: string };

/** Öncelikli hizmet bölgeleri (müşteri listesi): Tuzla, Pendik, Kartal, Maltepe, Ataşehir, Sarıyer, Gebze. */
const PRIORITY_KEYS = new Set([
  ...["tuzla", "pendik", "kartal", "maltepe", "atasehir", "sariyer"].map((d) => localKey.district("istanbul", d)),
  localKey.district("kocaeli", "gebze"),
  ...PRIORITY_DISTRICTS.map((d) => localKey.district("istanbul", d.slug)),
]);

export function regionTargets(): LocalTarget[] {
  return PROVINCES.flatMap((p) => [
    { key: localKey.province(p.slug), label: `${p.name} (il sayfası)`, group: p.name, path: routes.province(p.slug), kind: "bolge" as const, priority: false },
    ...p.districts.map((d) => {
      const key = localKey.district(p.slug, d.slug);
      return { key, label: d.name, group: p.name, path: routes.region(p.slug, d.slug), kind: "bolge" as const, priority: PRIORITY_KEYS.has(key) };
    }),
  ]);
}

export async function modelTargets(): Promise<LocalTarget[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, specifications: { select: { label: true, value: true, unit: true, variant: true }, orderBy: { sortOrder: "asc" } }, options: { select: { group: true, value: true }, orderBy: { sortOrder: "asc" } } },
  });
  return products.flatMap((p) =>
    buildModels(p).map((m) => ({
      key: localKey.model(p.slug, m.slug),
      label: m.code,
      group: p.name,
      path: modelPath(p.slug, m.slug),
      kind: "model" as const,
      priority: false,
      hint: MODEL_PAGES[p.slug]?.[m.slug] ? "Kod içinde özel tanıtımı da var" : undefined,
    })),
  );
}

export async function findTarget(key: string): Promise<LocalTarget | null> {
  if (key.startsWith("model:")) return (await modelTargets()).find((t) => t.key === key) ?? null;
  return regionTargets().find((t) => t.key === key) ?? null;
}
