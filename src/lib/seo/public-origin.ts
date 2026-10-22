/**
 * Admin formlarında gösterilen tam adresler için site kökü (istemcide de kullanılabilir). Canlıda
 * NEXT_PUBLIC_SITE_URL; tanımsızsa planlanan alan adı gösterilir (yalnızca görüntü — sayfa canonical'ı
 * sunucuda getSiteUrl() ile üretilir).
 */
export const PUBLIC_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.bifiresomine.com").replace(/\/+$/, "");

export const publicUrl = (path: string) => `${PUBLIC_ORIGIN}${path === "/" ? "" : path}`;
