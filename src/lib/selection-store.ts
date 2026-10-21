/**
 * Ürün sayfasındaki seçenek seçimini (ör. "Ölçü: 90'lık · Cam yönü: Sağ açık") aynı sayfadaki teklif formuna
 * taşıyan küçük istemci deposu. `useSyncExternalStore` ile okunur; sunucuda her zaman boş döner.
 */
let value = "";
const listeners = new Set<() => void>();

export const selectionStore = {
  get: () => value,
  getServer: () => "",
  set(next: string) {
    if (next === value) return;
    value = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
