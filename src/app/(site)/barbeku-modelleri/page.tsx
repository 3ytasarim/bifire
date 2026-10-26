import type { Metadata } from "next";
import { categoryMetadata, CategoryRoute } from "../urunler/category-route";

export const revalidate = 300;

/** Barbekü modelleri kategorisi (/barbeku-modelleri) — bkz. catalog.ts BBQ_ROOT. */
export async function generateMetadata(): Promise<Metadata> {
  return categoryMetadata("barbeku-modelleri");
}

export default function Page() {
  return <CategoryRoute kategori="barbeku-modelleri" at="/barbeku-modelleri" />;
}
