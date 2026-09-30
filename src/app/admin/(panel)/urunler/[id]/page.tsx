import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Flash, PageHeader } from "@/components/admin/ui";
import { deleteProduct } from "../actions";
import { getCategoryOptions, getProductForm } from "../data";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Ürün düzenle" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getProductForm(id), getCategoryOptions()]);
  if (!product) notFound();
  const { updatedAt, ...form } = product;
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={product.name} back={{ label: "Ürünler", href: "/admin/urunler" }} />
        <div className="flex gap-2">
          <a href={`/urun/${product.slug}`} target="_blank" className="inline-flex min-h-11 items-center border border-neutral-300 bg-white px-4 text-sm hover:border-ink">Sitede gör</a>
          <ConfirmAction action={deleteProduct.bind(null, product.id)} redirectTo="/admin/urunler" title={`“${product.name}” silinsin mi?`} description="Ürün, görsel kayıtları, teknik özellikleri ve dokümanlarıyla birlikte silinir. Bu ürüne ait talepler korunur." />
        </div>
      </div>
      <Flash message={kaydedildi ? "Ürün kaydedildi." : null} />
      <ProductForm key={updatedAt.toISOString()} product={form} categories={categories} />
    </div>
  );
}
