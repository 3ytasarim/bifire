import type { Metadata } from "next";
import { productMetadata, ProductRoute } from "../product-route";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return productMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductRoute slug={slug} at={`/urun/${slug}`} />;
}
