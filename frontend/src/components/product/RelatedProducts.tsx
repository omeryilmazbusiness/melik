'use client';

import { useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RelatedProduct } from '@/lib/types';
import { formatPriceWithCurrency } from '@/lib/format';

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Birlikte Alınanlar</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/urun/${product.slug}`}
            className="shrink-0 w-44 group"
          >
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-2">
              <AppImage
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="176px"
              />
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 leading-snug">{product.name}</p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {formatPriceWithCurrency(Number(product.price))}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
