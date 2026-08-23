import Link from 'next/link';
import type { Category } from '@/lib/types';

const HIDDEN_CATEGORIES = new Set(['anne-hamile', 'ayakkabi', 'oyuncak', 'ev-yasam']);

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const visible = categories.filter((cat) => !HIDDEN_CATEGORIES.has(cat.slug));

  return (
    <nav className="bg-gray-50/80 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-hide">
          {visible.map((cat) => {
            const isActive = activeSlug === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : cat.slug === 'outlet'
                      ? 'text-orange-500 hover:bg-orange-50'
                      : 'text-gray-600 hover:text-orange-500 hover:bg-white'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
