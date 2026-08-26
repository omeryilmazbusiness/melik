export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const PRODUCT_SECTIONS = [
  { key: 'yeni_sezon', title: 'Yeni Sezon', subtitle: 'Trend parçalar' },
  { key: 'firsat_urunler', title: 'Günün Fırsat Ürünleri', subtitle: 'Kaçırılmayacak indirimler' },
  { key: 'tek_fiyat', title: 'Tek Fiyat Zamanı', subtitle: 'Sabit fiyat fırsatları' },
];

export const VALID_SECTIONS = PRODUCT_SECTIONS.map((s) => s.key);

/** Boş / null → kampanya yok. Geçersiz değer → null dönüş (caller 400 verir). */
export function parseOptionalSection(section) {
  if (section === undefined) return { ok: true, unset: true, value: undefined };
  if (section === null || section === '') return { ok: true, unset: false, value: null };
  if (!VALID_SECTIONS.includes(section)) return { ok: false, unset: false, value: undefined };
  return { ok: true, unset: false, value: section };
}

export function computeDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
