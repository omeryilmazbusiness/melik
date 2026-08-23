'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/lib/types';

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const active = banners.filter((b) => b.is_active !== false && b.image_url);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % active.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [active.length]);

  if (!active.length) return null;

  const banner = active[Math.min(index, active.length - 1)];

  const prev = () => setIndex((i) => (i === 0 ? active.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % active.length);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-100/50 group">
        <div className="grid md:grid-cols-2 items-center min-h-[280px] sm:min-h-[320px]">
          <div className="p-8 sm:p-12 z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md">
                {banner.subtitle}
              </p>
            )}
            {banner.cta_text && (
              <Link
                href={banner.cta_link || '/'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-orange-200 text-sm sm:text-base"
              >
                {banner.cta_text}
                <ArrowRight size={18} />
              </Link>
            )}
          </div>

          <div className="relative h-52 sm:h-64 md:h-full md:min-h-[320px]">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {banner.badge_text && (
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                <span className="text-orange-500 font-bold text-sm">{banner.badge_text}</span>
              </div>
            )}
          </div>
        </div>

        {active.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="Önceki banner"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="Sonraki banner"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {active.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/80'
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
