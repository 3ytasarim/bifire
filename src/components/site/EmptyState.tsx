import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: { label: string; href: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-sand bg-paper px-6 py-16 text-center sm:px-12">
      <p className="font-display text-2xl font-semibold text-ink">{title}</p>
      {text ? <p className="mx-auto mt-3 max-w-lg text-steel">{text}</p> : null}
      {action ? (
        <div className="mt-8 flex justify-center">
          <ArrowFillButton href={action.href} tone="ink">
            {action.label}
          </ArrowFillButton>
        </div>
      ) : null}
    </div>
  );
}
