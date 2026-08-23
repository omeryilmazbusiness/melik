export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPriceWithCurrency(price: number): string {
  return `${formatPrice(price)} TL`;
}

export const SECTION_LABELS: Record<string, string> = {
  yeni_sezon: 'Yeni Sezon',
  firsat_urunler: 'Fırsat Ürünler',
  tek_fiyat: 'Tek Fiyat',
};
