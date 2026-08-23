import { formatPriceWithCurrency } from './format';

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '905551234567').replace(/\D/g, '');

export interface WhatsAppOrderParams {
  productName: string;
  subtitle?: string | null;
  brand?: string | null;
  model?: string | null;
  category?: string | null;
  color?: string | null;
  size?: string | null;
  ageRange?: string | null;
  quantity: number;
  unitPrice: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  productUrl?: string;
}

export function buildWhatsAppOrderMessage(params: WhatsAppOrderParams): string {
  const {
    productName,
    subtitle,
    brand,
    model,
    category,
    color,
    size,
    ageRange,
    quantity,
    unitPrice,
    originalPrice,
    discountPercent,
    productUrl,
  } = params;

  const total = unitPrice * quantity;
  const lines: string[] = [
    'Merhaba Şirin Kids,',
    '',
    'Bu ürünü satın almak istiyorum.',
    '',
    '─── Sipariş Detayı ───',
    `Ürün: ${productName}`,
  ];

  if (subtitle) lines.push(`Açıklama: ${subtitle}`);
  if (brand) lines.push(`Marka: ${brand}`);
  if (model) lines.push(`Model: ${model}`);
  if (category) lines.push(`Kategori: ${category}`);
  if (color) lines.push(`Renk: ${color}`);
  if (size) lines.push(`Beden: ${size}`);
  if (ageRange) lines.push(`Yaş Aralığı: ${ageRange}`);

  lines.push(`Adet: ${quantity}`);
  lines.push(`Birim Fiyat: ${formatPriceWithCurrency(unitPrice)}`);

  if (originalPrice && originalPrice > unitPrice) {
    lines.push(`Liste Fiyatı: ${formatPriceWithCurrency(originalPrice)}`);
  }
  if (discountPercent) {
    lines.push(`İndirim: %${discountPercent}`);
  }

  lines.push(`Toplam: ${formatPriceWithCurrency(total)}`);

  if (productUrl) {
    lines.push('');
    lines.push(`Ürün Linki: ${productUrl}`);
  }

  lines.push('');
  lines.push('Siparişimi onaylamanızı rica ederim. Teşekkürler.');

  return lines.join('\n');
}

export function buildWhatsAppUrl(params: WhatsAppOrderParams): string {
  if (!WHATSAPP_NUMBER) {
    throw new Error('WhatsApp numarası tanımlı değil (NEXT_PUBLIC_WHATSAPP_NUMBER)');
  }

  const message = buildWhatsAppOrderMessage(params);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
