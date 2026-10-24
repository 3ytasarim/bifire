import type { Metadata } from "next";
import { categoryMetadata, CategoryRoute } from "../../urunler/category-route";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ alt: string }> };

/** Elektrikli alt kategorisi (/elektrikli-somineler/2-boyutlu-somineler). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata((await params).alt);
}

export default async function Page({ params }: Props) {
  const { alt } = await params;
  return <CategoryRoute kategori={alt} at={`/elektrikli-somineler/${alt}`} />;
}
