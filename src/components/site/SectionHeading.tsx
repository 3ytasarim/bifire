import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  tone = "dark",
  action,
  as: Tag = "h2",
  center,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  id?: string;
  /** "dark" = açık zeminde koyu metin (varsayılan); "light" = koyu/fotoğraflı zeminde beyaz metin */
  tone?: "dark" | "light";
  action?: { label: string; href: string };
  as?: "h1" | "h2";
  center?: boolean;
}) {
  const light = tone === "light";
  return (
    <div className={`reveal flex flex-col gap-8 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className="max-w-3xl">
        {eyebrow ? <p className={`eyebrow ${light ? "text-amber" : "text-ember-ink"} ${center ? "justify-center" : ""}`}>{eyebrow}</p> : null}
        <Tag id={id} className={`display-2 mt-5 ${light ? "text-white" : "text-ink"}`}>
          {title}
        </Tag>
        {intro ? <p className={`lead mt-6 max-w-2xl ${light ? "text-white/75" : "text-steel"} ${center ? "mx-auto" : ""}`}>{intro}</p> : null}
      </div>
      {action ? (
        <ArrowFillButton href={action.href} tone={light ? "glass" : "light"} size="sm" className="shrink-0">
          {action.label}
        </ArrowFillButton>
      ) : null}
    </div>
  );
}
