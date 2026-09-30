import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { getCategoryOptions } from "../data";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Yeni ürün" };

export default async function NewProductPage() {
  const categories = await getCategoryOptions();
  return (
    <div>
      <PageHeader title="Yeni ürün" back={{ label: "Ürünler", href: "/admin/urunler" }} />
      {categories.length ? (
        <ProductForm categories={categories} />
      ) : (
        <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ürün eklemeden önce en az bir kategori oluşturun. <Link href="/admin/kategoriler/yeni" className="font-semibold underline">Kategori ekle</Link>
        </p>
      )}
    </div>
  );
}
