import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Yönetim", template: "%s · Bifire Yönetim" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-neutral-100 text-ink">{children}</div>;
}
