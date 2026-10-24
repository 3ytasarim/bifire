"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  FolderTree,
  Gauge,
  Images,
  Inbox,
  Contact,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  LayoutTemplate,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Tags,
  UserCog,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";

const NAV = [
  { group: "Genel", items: [{ href: "/admin", label: "Panel", icon: Gauge }, { href: "/admin/talepler", label: "Talepler", icon: Inbox, badge: "requests" as const }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/crm", label: "Genel bakış", icon: LayoutDashboard, exact: true },
      { href: "/admin/crm/musteriler", label: "Müşteriler", icon: Contact },
      { href: "/admin/crm/surec", label: "Satış süreci", icon: KanbanSquare },
      { href: "/admin/crm/gorevler", label: "Görevler", icon: ListChecks, badge: "overdue" as const },
      { href: "/admin/crm/mesajlar", label: "Hazır mesajlar", icon: MessageSquareText },
    ],
  },
  {
    group: "Katalog",
    items: [
      { href: "/admin/urunler", label: "Ürünler", icon: Package },
      { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
      { href: "/admin/urun-etiketleri", label: "Etiketler", icon: Tags },
    ],
  },
  {
    group: "İçerik",
    items: [
      { href: "/admin/slider", label: "Slider", icon: LayoutTemplate },
      { href: "/admin/projeler", label: "Projeler", icon: Warehouse },
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/medya", label: "Medya", icon: Images },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/ayarlar", label: "Site ayarları", icon: Settings },
      { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users, minRole: "ADMIN" as const },
      { href: "/admin/profil", label: "Profilim", icon: UserCog },
    ],
  },
];

export function AdminShell({ user, unread, overdue = 0, children }: { user: { name: string; email: string; role: string }; unread: number; overdue?: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Sayfa değişince mobil menü kapanır (render sırasında önceki yol ile karşılaştırma, effect yok).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const isActive = (href: string, exact?: boolean) => (href === "/admin" || exact ? pathname === href : pathname.startsWith(href));
  const canAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";

  const nav = (
    <nav aria-label="Yönetim menüsü" className="flex-1 overflow-y-auto px-3 py-4">
      {NAV.map((g) => (
        <div key={g.group} className="mb-6">
          <p className="px-3 text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">{g.group}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items
              .filter((it) => !("minRole" in it) || canAdmin)
              .map((it) => {
                const Icon = it.icon;
                const active = isActive(it.href, "exact" in it && it.exact);
                const count = "badge" in it ? (it.badge === "overdue" ? overdue : unread) : 0;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-3 px-3 text-sm transition-colors ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                    >
                      <Icon aria-hidden="true" className={`h-4 w-4 ${active ? "text-ember" : ""}`} />
                      <span className="flex-1">{it.label}</span>
                      {count > 0 ? (
                        <span title={"badge" in it && it.badge === "overdue" ? "Tarihi geçen görev ve takipler" : "Okunmamış talepler"} className={`min-w-6 px-1.5 text-center text-xs font-semibold ${"badge" in it && it.badge === "overdue" ? "bg-red-600 text-white" : "bg-ember text-ink"}`}>
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-medium text-white">{user.name}</p>
      <p className="truncate text-xs text-white/50">{user.email}</p>
      <div className="mt-3 flex gap-2">
        <a href="/" target="_blank" className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 border border-white/15 text-xs text-white/80 hover:text-white">
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /> Siteyi aç
        </a>
        <form action={logoutAction} className="flex-1">
          <button type="submit" className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 border border-white/15 text-xs text-white/80 hover:text-white">
            <LogOut aria-hidden="true" className="h-3.5 w-3.5" /> Çıkış
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-ink lg:flex">
        <Link href="/admin" className="flex h-16 items-center px-6 font-display text-lg font-semibold tracking-[0.3em] text-white">
          BİFİRE
        </Link>
        {nav}
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Link href="/admin" className="font-display font-semibold tracking-[0.3em]">
          BİFİRE
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Menüyü kapat" : "Menüyü aç"} className="flex h-11 w-11 items-center justify-center">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open ? (
        <div className="fixed inset-x-0 top-14 bottom-0 z-30 flex flex-col bg-ink lg:hidden">
          {nav}
          {footer}
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
