import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";

/** CRM şimdilik gizli (lib/features.ts › crm). Açmak için `crm: true`. */
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.crm) notFound();
  return children;
}
