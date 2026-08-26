'use client';

import { useState, useMemo, useCallback } from 'react';
import AppImage from '@/components/AppImage';
import { Minus, Plus, Ruler, TrendingDown, MessageCircle } from 'lucide-react';
import type { Product, ProductSize, ColorVariant } from '@/lib/types';
import { formatPriceWithCurrency } from '@/lib/format';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const sizes: ProductSize[] = useMemo(() => {
    if (Array.isArray(product.sizes)) return product.sizes;
    if (typeof product.sizes === 'string') {
      try {
        return JSON.parse(product.sizes);
      } catch {
        return [];
      }
    }
    return [];
  }, [product.sizes]);

  const colorVariants: ColorVariant[] = useMemo(() => {
    if (Array.isArray(product.color_variants)) return product.color_variants;
    if (typeof product.color_variants === 'string') {
      try {
        return JSON.parse(product.color_variants);
      } catch {
        return product.color ? [{ name: product.color, image_url: product.image_url }] : [];
      }
    }
    return product.color ? [{ name: product.color, image_url: product.image_url }] : [];
  }, [product.color_variants, product.color, product.image_url]);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => sizes.find((s) => s.in_stock)?.label || '');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const price = Number(product.price);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const requiresSize = sizes.length > 0;

  const openWhatsApp = useCallback(() => {
    if (requiresSize && !selectedSize) {
      setSizeError(true);
      return;
    }

    setSizeError(false);

    const productUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/urun/${product.slug}`
        : undefined;

    const url = buildWhatsAppUrl({
      productName: product.name,
      subtitle: product.subtitle,
      brand: product.brand || 'Şirin Kids',
      model: product.model,
      category: product.category_name,
      color: colorVariants[selectedColor]?.name || product.color,
      size: selectedSize || undefined,
      ageRange: product.age_range,
      quantity,
      unitPrice: price,
      originalPrice,
      discountPercent: product.discount_percent,
      productUrl,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  }, [
    requiresSize,
    selectedSize,
    product,
    colorVariants,
    selectedColor,
    quantity,
    price,
    originalPrice,
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="text-sm text-gray-400 mt-1">{product.subtitle}</p>
        )}
      </div>

      <div className="space-y-1">
        {originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 line-through">
              {formatPriceWithCurrency(originalPrice)}
            </span>
            {product.discount_percent && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <TrendingDown size={12} />
                %{product.discount_percent}
              </span>
            )}
          </div>
        )}
        <p className="text-3xl font-bold text-orange-500">
          {formatPriceWithCurrency(price)}
        </p>
      </div>

      {colorVariants.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Renk: <span className="text-gray-500">{colorVariants[selectedColor]?.name}</span>
          </p>
          <div className="flex gap-2">
            {colorVariants.map((variant, i) => (
              <button
                key={variant.name + i}
                type="button"
                onClick={() => setSelectedColor(i)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  i === selectedColor ? 'border-orange-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AppImage src={variant.image_url} alt={variant.name} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Beden: <span className="text-gray-500">{selectedSize || 'Seçiniz'}</span>
            </p>
            <button type="button" className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors">
              <Ruler size={14} />
              Beden Ölçüsü
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.label}
                type="button"
                disabled={!size.in_stock}
                onClick={() => {
                  if (size.in_stock) {
                    setSelectedSize(size.label);
                    setSizeError(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  !size.in_stock
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : selectedSize === size.label
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {size.label}
                {!size.in_stock && <span className="block text-[10px] text-gray-300">Tükendi</span>}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="mt-2 text-xs text-red-500 font-medium">Lütfen beden seçiniz.</p>
          )}
        </div>
      )}

      <div className="space-y-1 text-sm">
        <p className="flex items-center gap-2 text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Stokta var
        </p>
        <p className="text-gray-500 text-xs">Tahmini Kargoya Veriliş Süresi: 2 iş günü</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="Adet azalt"
          >
            <Minus size={16} />
          </button>
          <span className="w-16 text-center text-sm font-medium border-x border-gray-200 py-2.5">
            {quantity} Adet
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            aria-label="Adet artır"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={openWhatsApp}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold rounded-xl transition-colors text-sm sm:text-base shadow-sm"
        >
          <MessageCircle size={18} />
          SATIN AL
        </button>
      </div>

      {quantity > 1 && (
        <p className="text-sm text-gray-500">
          Toplam: <span className="font-bold text-gray-900">{formatPriceWithCurrency(price * quantity)}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
        <div>
          <span className="text-gray-400">Marka</span>
          <p className="font-medium text-gray-800 mt-0.5">{product.brand || 'Şirin Kids'}</p>
        </div>
        <div>
          <span className="text-gray-400">Model</span>
          <p className="font-medium text-orange-500 mt-0.5">{product.model || '—'}</p>
        </div>
      </div>
    </div>
  );
}
