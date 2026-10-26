import type { Metadata } from "next";
import { productMetadata, ProductRoute } from "../../urun/product-route";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ urun: string }> };

/** Barbekü ürünü (/barbeku-modelleri/firinli-tezgahli-barbeku). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return productMetadata((await params).urun);
}

export default async function Page({ params }: Props) {
  const { urun } = await params;
  return <ProductRoute slug={urun} at={`/barbeku-modelleri/${urun}`} />;
}
