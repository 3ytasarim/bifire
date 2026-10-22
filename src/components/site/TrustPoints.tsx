import { Factory, MapPin, Wrench } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Motion";
import { TRUST_POINTS } from "@/content/company";

const ICONS = [Factory, Wrench, MapPin];

/** Doğrulanmış firma gerçekleri: kendi üretim, kendi montaj ekibi, Tuzla fabrika showroom. */
export function TrustPoints({ tone = "light", compact }: { tone?: "light" | "dark"; compact?: boolean }) {
  const dark = tone === "dark";
  return (
    <Stagger className={`grid gap-3 ${compact ? "" : "sm:grid-cols-3"}`} gap={0.1}>
      {TRUST_POINTS.map((t, i) => {
        const Icon = ICONS[i]!;
        return (
          <StaggerItem key={t.title} className={`flex items-start gap-3 ${compact ? "" : "rounded-2xl p-4"} ${!compact && !dark ? "border border-linen bg-white" : ""} ${!compact && dark ? "border border-white/15 bg-white/5 backdrop-blur-sm" : ""}`}>
            <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${dark ? "bg-white/10 text-ember" : "bg-ember/10 text-ember-ink"}`}>
              <Icon className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <span>
              <span className={`block text-[14px] font-semibold ${dark ? "text-white" : "text-ink"}`}>{t.title}</span>
              {compact ? null : <span className={`mt-0.5 block text-[13px] leading-relaxed ${dark ? "text-white/70" : "text-steel"}`}>{t.text}</span>}
            </span>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
