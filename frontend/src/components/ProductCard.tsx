'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import { Heart, TrendingDown } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPriceWithCurrency } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const price = Number(product.price);
  const originalPrice = product.original_price ? Number(product.original_price) : null;

  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300">
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
          <AppImage
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {product.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${
              product.badge === 'Süper Fiyat' || product.badge === 'Günün Fırsatı'
                ? 'bg-pink-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
              {product.badge}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white/90 backdrop-blur-sm text-orange-400 hover:bg-white shadow-sm'
            }`}
            aria-label="Favorilere ekle"
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-3.5">
          <h3 className="text-sm text-gray-700 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-end gap-2 flex-wrap">
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPriceWithCurrency(originalPrice)}
              </span>
            )}
            {product.discount_percent && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                <TrendingDown size={12} />
                %{product.discount_percent}
              </span>
            )}
          </div>

          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {formatPriceWithCurrency(price)}
          </p>
        </div>
      </Link>
    </article>
  );
}
