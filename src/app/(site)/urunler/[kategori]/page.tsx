import type { Metadata } from "next";
import { categoryMetadata, CategoryRoute } from "../category-route";

export const revalidate = 300;

// Kategoriler build'de değil ilk istekte üretilip önbelleğe alınır (ISR); yeni kategori için yeniden build gerekmez.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ kategori: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata((await params).kategori);
}

export default async function Page({ params }: Props) {
  return <CategoryRoute kategori={(await params).kategori} base="urunler" />;
}
