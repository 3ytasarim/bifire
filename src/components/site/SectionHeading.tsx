import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  tone = "dark",
  action,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  id?: string;
  tone?: "dark" | "light";
  action?: { label: string; href: string };
  as?: "h1" | "h2";
}) {
  const light = tone === "light";
  return (
    <div className="reveal flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className={`eyebrow ${light ? "text-amber" : "text-ember-ink"}`}>{eyebrow}</p> : null}
        <Tag id={id} className={`display-2 mt-5 ${light ? "text-white" : "text-ink"}`}>
          {title}
        </Tag>
        {intro ? <p className={`lead mt-6 max-w-2xl ${light ? "text-white/70" : "text-steel"}`}>{intro}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={`btn shrink-0 self-start md:self-auto ${light ? "btn-ghost-light" : "btn-ghost-dark"}`}>
          {action.label}
          <ArrowRight aria-hidden="true" className="btn-arrow h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
