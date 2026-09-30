import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/site/LegalPage";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("kvkk", "/kvkk");
}

export default function Page() {
  return <LegalPage docKey="kvkk" path="/kvkk" />;
}
