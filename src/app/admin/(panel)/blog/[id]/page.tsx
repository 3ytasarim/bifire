import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Flash, PageHeader } from "@/components/admin/ui";
import { deletePost } from "../actions";
import { getKnownTags, getPostForm, getProductOptions } from "../data";
import { PostForm } from "../PostForm";

export const metadata = { title: "Yazı düzenle" };

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const [post, products, knownTags] = await Promise.all([getPostForm(id), getProductOptions(), getKnownTags()]);
  if (!post) notFound();
  const { updatedAt, ...form } = post;
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={post.title} back={{ label: "Blog", href: "/admin/blog" }} />
        <div className="flex gap-2">
          {post.published ? (
            <a href={`/somine-rehberi/${post.slug}`} target="_blank" className="inline-flex min-h-11 items-center border border-neutral-300 bg-white px-4 text-sm hover:border-ink">Sitede gör</a>
          ) : null}
          <ConfirmAction action={deletePost.bind(null, post.id)} redirectTo="/admin/blog" title={`“${post.title}” silinsin mi?`} description="Yazı kalıcı olarak silinir." />
        </div>
      </div>
      <Flash message={kaydedildi ? (post.published ? "Yazı kaydedildi ve yayında." : "Taslak kaydedildi.") : null} />
      <PostForm key={updatedAt.toISOString()} post={form} products={products} knownTags={knownTags} />
    </div>
  );
}
