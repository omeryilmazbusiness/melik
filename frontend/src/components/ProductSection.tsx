'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  sectionKey: string;
  seeAllHref?: string;
  showPromoCard?: boolean;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  sectionKey,
  seeAllHref,
  showPromoCard = false,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const href = seeAllHref || `/koleksiyon/${sectionKey}`;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (!products.length) return null;

  return (
    <section id={`section-${sectionKey}`} className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
        >
          Tümünü görüntüle
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="relative group">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        >
          {showPromoCard && (
            <div className="shrink-0 w-52 sm:w-60 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white text-center">
              <span className="text-4xl mb-3">⏰</span>
              <h3 className="font-black text-lg leading-tight uppercase tracking-wide">
                Günün<br />Süper<br />Fırsatı
              </h3>
            </div>
          )}

          {products.map((product) => (
            <div key={product.id} className="shrink-0 w-52 sm:w-56">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
