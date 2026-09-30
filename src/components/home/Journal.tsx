import { HOME } from "@/content/home";
import type { PostCardData } from "@/lib/queries";
import { PostCard } from "@/components/site/Cards";
import { SectionHeading } from "@/components/site/SectionHeading";

export function Journal({ posts }: { posts: PostCardData[] }) {
  if (!posts.length) return null;
  const j = HOME.journal;
  return (
    <section aria-labelledby="home-journal" className="border-t border-sand bg-bone py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading id="home-journal" eyebrow={j.eyebrow} title={j.title} intro={j.intro} action={{ label: "Tüm yazılar", href: "/blog" }} />
        <ul className="mt-14 grid gap-12 sm:mt-20 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id} className="reveal">
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
