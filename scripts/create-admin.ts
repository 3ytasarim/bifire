/**
 * İlk yöneticiyi (SUPERADMIN) oluşturur. Şifre kaynak kodda DEĞİL; .env'deki
 * ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD değerlerinden okunur.
 *
 *   npm run admin:create            → kullanıcı yoksa oluşturur (varsa dokunmaz)
 *   npm run admin:create -- --reset → mevcut kullanıcının şifresini .env'deki ile değiştirir
 *
 * Kurulumdan sonra ADMIN_SEED_PASSWORD'ü .env'den silin ve panelde Profilim'den şifrenizi değiştirin.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "";
  const reset = process.argv.includes("--reset");

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("ADMIN_SEED_EMAIL geçerli bir e-posta olmalı.");
  if (password.length < 10) throw new Error("ADMIN_SEED_PASSWORD en az 10 karakter olmalı.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL?.replace(/sslmode=require\b/, "sslmode=verify-full") }) });
  try {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
    if (existing) {
      if (!reset) {
        console.log(`Kullanıcı zaten var: ${email} (değişiklik yapılmadı; şifreyi sıfırlamak için --reset).`);
        return;
      }
      await prisma.adminUser.update({ where: { email }, data: { passwordHash, active: true } });
      await prisma.session.deleteMany({ where: { adminUserId: existing.id } });
      console.log(`Şifre güncellendi: ${email}`);
      return;
    }
    await prisma.adminUser.create({ data: { email, name: "Yönetici", passwordHash, role: "SUPERADMIN" } });
    console.log(`Süper yönetici oluşturuldu: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
