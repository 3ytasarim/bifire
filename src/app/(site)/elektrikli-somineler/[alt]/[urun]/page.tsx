import type { Metadata } from "next";
import { productMetadata, ProductRoute } from "../../../urun/product-route";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ alt: string; urun: string }> };

/** Elektrikli alt kategorideki ürün (/elektrikli-somineler/2-boyutlu-somineler/zaya-pagla-70). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return productMetadata((await params).urun);
}

export default async function Page({ params }: Props) {
  const { alt, urun } = await params;
  return <ProductRoute slug={urun} at={`/elektrikli-somineler/${alt}/${urun}`} />;
}
