import type { Metadata } from "next";
import { categoryMetadata, CategoryRoute } from "../urunler/category-route";

export const revalidate = 300;

/** Elektrikli Şömineler ana kategorisi (/elektrikli-somineler) — bkz. catalog.ts ELECTRIC_ROOT. */
export async function generateMetadata(): Promise<Metadata> {
  return categoryMetadata("elektrikli-somineler");
}

export default function Page() {
  return <CategoryRoute kategori="elektrikli-somineler" at="/elektrikli-somineler" />;
}
