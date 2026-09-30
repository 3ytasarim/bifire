import { PageHeader } from "@/components/admin/ui";
import { getKnownTags, getProductOptions } from "../data";
import { PostForm } from "../PostForm";

export const metadata = { title: "Yeni yazı" };

export default async function NewPostPage() {
  const [products, knownTags] = await Promise.all([getProductOptions(), getKnownTags()]);
  return (
    <div>
      <PageHeader title="Yeni yazı" back={{ label: "Blog", href: "/admin/blog" }} />
      <PostForm products={products} knownTags={knownTags} />
    </div>
  );
}
