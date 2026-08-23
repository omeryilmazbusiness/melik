import Link from 'next/link';
import SearchBar from './SearchBar';
import { Logo } from './Logo';
import type { Category } from '@/lib/types';

interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16 sm:h-[72px]">
          <Link href="/" className="shrink-0">
            <Logo size="md" />
          </Link>

          <SearchBar categories={categories} />

          <Link
            href="/hakkimizda"
            className="hidden sm:inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors shrink-0 whitespace-nowrap"
          >
            Hakkımızda
          </Link>
        </div>
      </div>
    </header>
  );
}
