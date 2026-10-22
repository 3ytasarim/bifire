"use client";

import { useSyncExternalStore } from "react";
import { selectionStore } from "@/lib/selection-store";
import { splitVariant, variantKeyOf } from "@/lib/variants";

/**
 * Ürün sayfasında seçili modelin anahtarı ("Seri 01 / 70'lik"). Sunucuda ve ilk çizimde seçim deposu boştur;
 * o durumda `fallback` (ilk model) kullanılır — SSR HTML'i ilk modelin değerleriyle gelir.
 */
export function useVariantKey(groups: string[], fallback: string) {
  const picked = useSyncExternalStore(selectionStore.subscribe, selectionStore.getPicked, selectionStore.getPickedServer);
  const key = groups.length ? variantKeyOf(groups, picked, fallback) : fallback;
  const label = groups.length ? splitVariant(key).join(" · ") : fallback;
  return { key, label, picked };
}
