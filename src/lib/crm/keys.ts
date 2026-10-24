/**
 * Mükerrer müşteri eşleştirme anahtarları. Telefon: yalnız rakamlar, son 10 hane (0532 123 45 67, +90 532 123 45 67
 * ve 5321234567 aynı anahtara iner). E-posta: küçük harf, boşluksuz. Anahtar yoksa eşleştirme yapılmaz.
 */
export function phoneKey(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

export function emailKey(email: string | null | undefined): string | null {
  const e = (email ?? "").trim().toLocaleLowerCase("en");
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}
