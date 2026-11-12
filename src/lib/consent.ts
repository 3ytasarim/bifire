/** Çerez tercihi (KVKK). Sürüm değişirse (yeni kategori vb.) ziyaretçiye pencere yeniden gösterilir. */
export const CONSENT_STORAGE_KEY = "bifire-cerez-tercihi";
export const CONSENT_VERSION = 1;
export const CONSENT_OPEN_EVENT = "bifire:cerez-tercihleri";

export type ConsentChoice = { v: number; analytics: boolean; marketing: boolean; at: string };
