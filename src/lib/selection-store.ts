/**
 * Ürün sayfasındaki seçenek seçimini aynı sayfadaki bileşenlere (teklif formu, ölçüye göre teknik değerler)
 * taşıyan küçük istemci deposu. `useSyncExternalStore` ile okunur; sunucuda her zaman boş döner.
 * - `get()` → özet metin ("Ölçü: 90'lık · Cam yönü: Sağ açık"), forma gider.
 * - `getPicked()` → seçili değerler ({ "Ölçü": "90'lık" }), teknik değer bileşenleri kullanır.
 */
type Picked = Record<string, string>;

let value = "";
let picked: Picked = {};
const EMPTY: Picked = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const selectionStore = {
  get: () => value,
  getServer: () => "",
  getPicked: () => picked,
  getPickedServer: () => EMPTY,
  set(next: string, nextPicked?: Picked) {
    const pickedChanged = nextPicked !== undefined && JSON.stringify(nextPicked) !== JSON.stringify(picked);
    if (next === value && !pickedChanged) return;
    value = next;
    if (pickedChanged) picked = nextPicked!;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
