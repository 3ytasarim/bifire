import Link from "next/link";

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: { label: string; href: string } }) {
  return (
    <div className="border border-dashed border-sand bg-bone px-6 py-16 text-center sm:px-12">
      <p className="font-display text-2xl font-semibold text-ink">{title}</p>
      {text ? <p className="mx-auto mt-3 max-w-lg text-steel">{text}</p> : null}
      {action ? (
        <Link href={action.href} className="btn btn-dark mt-8">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
