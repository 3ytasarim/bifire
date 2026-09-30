import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/site/LegalPage";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("gizlilik", "/gizlilik-politikasi");
}

export default function Page() {
  return <LegalPage docKey="gizlilik" path="/gizlilik-politikasi" />;
}
