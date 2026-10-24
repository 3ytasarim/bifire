import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CrmStage } from "@prisma/client";
import { Badge } from "@/components/admin/ui";
import { CRM_STAGES, dueState, fmtDate, projectCode } from "@/lib/crm/labels";

export function StageBadge({ stage }: { stage: CrmStage }) {
  return <Badge tone={CRM_STAGES[stage].tone}>{CRM_STAGES[stage].label}</Badge>;
}

export function DueBadge({ date, done }: { date: Date | null; done?: boolean }) {
  const s = dueState(date, done);
  if (!s) return <span className="text-neutral-400">—</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="block text-neutral-700">{fmtDate(date)}</span>
      <Badge tone={s.tone}>{s.label}</Badge>
    </span>
  );
}

/** CRM alt menüsü (sayfaların üstünde). */
export function CrmTabs({ active }: { active: "panel" | "musteriler" | "surec" | "gorevler" | "mesajlar" }) {
  const tabs = [
    ["panel", "/admin/crm", "Genel bakış"],
    ["musteriler", "/admin/crm/musteriler", "Müşteriler"],
    ["surec", "/admin/crm/surec", "Satış süreci"],
    ["gorevler", "/admin/crm/gorevler", "Görevler"],
    ["mesajlar", "/admin/crm/mesajlar", "Hazır mesajlar"],
  ] as const;
  return (
    <nav aria-label="CRM" className="mb-6 flex gap-1 overflow-x-auto border-b border-neutral-200">
      {tabs.map(([key, href, label]) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap ${active === key ? "border-ember text-ink" : "border-transparent text-neutral-500 hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Müşteri/proje tablosu satırı içeriği (liste ve genel bakışta ortak). */
export function ProjectCell({ p }: { p: { id: string; code: number; title: string; location: string | null; customer: { name: string } } }) {
  return (
    <Link href={`/admin/crm/proje/${p.id}`} className="group block">
      <span className="font-semibold group-hover:underline">{p.customer.name}</span>
      <span className="ml-2 text-xs text-neutral-400">{projectCode(p.code)}</span>
      <span className="block text-xs text-neutral-500">
        {p.title}
        {p.location ? ` · ${p.location}` : ""}
      </span>
    </Link>
  );
}

export function OpenLink({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="Kartı aç" className="inline-flex h-8 w-8 items-center justify-center border border-neutral-200 hover:border-ink">
      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}
