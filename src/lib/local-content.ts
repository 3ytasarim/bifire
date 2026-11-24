import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Sayfaya özel yerel içerik (Admin > Yerel İçerik). Model ve hizmet bölgesi sayfaları ortak şablonla çalışır;
 * bu kayıt varsa o sayfaya özgü açıklama, not ve gerçek fotoğraf eklenir. Kayıt yoksa veya tablo okunamazsa
 * (ör. migration henüz uygulanmamış ortam) sayfa hiç etkilenmeden ortak şablonla açılır.
 */
export type LocalContent = {
  key: string;
  intro: string | null;
  note: string | null;
  image: string | null;
  imageAlt: string | null;
  image2: string | null;
  image2Alt: string | null;
  updatedAt: Date;
};

export const localKey = {
  model: (productSlug: string, modelSlug: string) => `model:${productSlug}/${modelSlug}`,
  district: (il: string, ilce: string) => `bolge:${il}/${ilce}`,
  province: (il: string) => `il:${il}`,
};

export const getLocalContent = cache(async (key: string): Promise<LocalContent | null> => {
  try {
    const row = await prisma.localContent.findUnique({ where: { key } });
    return row && (row.intro || row.note || row.image || row.image2) ? row : null;
  } catch (e) {
    console.error("[local-content] okunamadı:", key, e instanceof Error ? e.message : e);
    return null;
  }
});
