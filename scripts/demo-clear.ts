/**
 * Test/demo verilerini temizler. Yalnızca açıkça DEMO olarak işaretlenmiş kayıtlar silinir:
 *   - adı/başlığı "DEMO" ile başlayan kategori, ürün, proje, blog yazısı
 *   - alt metni "DEMO" ile başlayan slider kayıtları
 *   - adı "DEMO" ile başlayan talepler, adı "DEMO" olan etiketler
 *   - yukarıdakilerin kullandığı ve başka hiçbir yerde kullanılmayan yüklenmiş görseller (dosya + Media kaydı)
 *
 *   npm run demo:clear            → ne silineceğini listeler (kuru çalıştırma)
 *   npm run demo:clear -- --yes   → siler
 */
import "dotenv/config";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL?.replace(/sslmode=require\b/, "sslmode=verify-full") }) });
const DEMO = { startsWith: "DEMO" };
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage", "uploads"));

async function main() {
  const apply = process.argv.includes("--yes");
  const [categories, products, projects, posts, slides, requests] = await Promise.all([
    prisma.productCategory.findMany({ where: { name: DEMO }, select: { id: true, name: true, image: true, ogImage: true, content: true } }),
    prisma.product.findMany({ where: { name: DEMO }, include: { images: true, documents: true } }),
    prisma.project.findMany({ where: { title: DEMO }, include: { images: true } }),
    prisma.blogPost.findMany({ where: { title: DEMO }, select: { id: true, title: true, coverImage: true, ogImage: true, content: true } }),
    prisma.heroSlide.findMany({ where: { imageAlt: DEMO }, select: { id: true, title: true, desktopImage: true, mobileImage: true } }),
    prisma.contactRequest.findMany({ where: { name: DEMO }, select: { id: true, name: true } }),
  ]);

  const urls = new Set<string>();
  const add = (u?: string | null) => u?.startsWith("/uploads/") && urls.add(u);
  const fromHtml = (html?: string | null) => [...(html ?? "").matchAll(/src="(\/uploads\/[^"]+)"/g)].forEach((m) => add(m[1]));
  categories.forEach((c) => (add(c.image), add(c.ogImage), fromHtml(c.content)));
  products.forEach((p) => (add(p.coverImage), add(p.ogImage), fromHtml(p.description), p.images.forEach((i) => add(i.url)), p.documents.forEach((d) => add(d.url))));
  projects.forEach((p) => (add(p.coverImage), add(p.ogImage), fromHtml(p.content), p.images.forEach((i) => add(i.url))));
  posts.forEach((p) => (add(p.coverImage), add(p.ogImage), fromHtml(p.content)));
  slides.forEach((s) => (add(s.desktopImage), add(s.mobileImage)));
  // Hiçbir kayda bağlı olmayan ama DEMO olarak yüklenmiş görseller (dosya adı "demo" içerir)
  (await prisma.media.findMany({ where: { OR: [{ originalName: { startsWith: "demo-" } }, { alt: DEMO }] }, select: { url: true } })).forEach((m) => add(m.url));

  console.log(`Kategoriler: ${categories.map((x) => x.name).join(", ") || "-"}`);
  console.log(`Ürünler: ${products.map((x) => x.name).join(", ") || "-"}`);
  console.log(`Projeler: ${projects.map((x) => x.title).join(", ") || "-"}`);
  console.log(`Blog: ${posts.map((x) => x.title).join(", ") || "-"}`);
  console.log(`Slider: ${slides.map((x) => x.title).join(", ") || "-"}`);
  console.log(`Talepler: ${requests.length}`);
  console.log(`Görseller/dokümanlar: ${urls.size}`);

  if (!apply) {
    console.log("\nKuru çalıştırma — hiçbir şey silinmedi. Silmek için: npm run demo:clear -- --yes");
    return;
  }

  await prisma.$transaction([
    prisma.contactRequest.deleteMany({ where: { id: { in: requests.map((r) => r.id) } } }),
    prisma.heroSlide.deleteMany({ where: { id: { in: slides.map((s) => s.id) } } }),
    prisma.blogPost.deleteMany({ where: { id: { in: posts.map((p) => p.id) } } }),
    prisma.project.deleteMany({ where: { id: { in: projects.map((p) => p.id) } } }),
    prisma.product.deleteMany({ where: { id: { in: products.map((p) => p.id) } } }),
    // Önce alt kategoriler, sonra ana kategoriler (Restrict ilişkisi).
    prisma.productCategory.deleteMany({ where: { id: { in: categories.map((c) => c.id) }, parentId: { not: null } } }),
    prisma.productCategory.deleteMany({ where: { id: { in: categories.map((c) => c.id) } } }),
    prisma.productTag.deleteMany({ where: { name: "DEMO" } }),
    prisma.blogTag.deleteMany({ where: { name: "DEMO" } }),
    prisma.redirect.deleteMany({ where: { OR: [{ sourcePath: { contains: "/demo-" } }, { destinationPath: { contains: "/demo-" } }] } }),
  ]);

  let removed = 0;
  for (const url of urls) {
    const media = await prisma.media.findUnique({ where: { url } });
    await prisma.media.deleteMany({ where: { url } });
    const key = media?.storageKey ?? url.slice("/uploads/".length);
    const file = path.resolve(UPLOAD_ROOT, key);
    if (file.startsWith(UPLOAD_ROOT + path.sep)) await unlink(file).then(() => removed++).catch(() => {});
  }
  console.log(`\nDEMO verileri silindi. Silinen dosya: ${removed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
