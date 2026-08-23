'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { getSearchSuggestions, searchProducts } from '@/lib/api';
import type { SearchSuggestion, Product, Category } from '@/lib/types';
import { formatPriceWithCurrency } from '@/lib/format';
import Image from 'next/image';

interface SearchBarProps {
  categories: Category[];
}

const SECTIONS = [
  { value: '', label: 'Tüm Kategoriler' },
  { value: 'yeni_sezon', label: 'Yeni Sezon' },
  { value: 'firsat_urunler', label: 'Fırsat Ürünler' },
  { value: 'tek_fiyat', label: 'Tek Fiyat' },
];

export default function SearchBar({ categories }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [section, setSection] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await getSearchSuggestions(q);
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setHasSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    if (value.length >= 2) setShowResults(true);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query && !category && !section) return;

    setIsSearching(true);
    setShowResults(true);
    setHasSearched(true);
    setSuggestions([]);

    try {
      const params: Record<string, string> = {};
      if (query) params.q = query;
      if (category) params.category = category;
      if (section) params.section = section;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      params.limit = '20';

      const res = await searchProducts(params);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setCategory('');
    setSection('');
    setMinPrice('');
    setMaxPrice('');
    setResults([]);
    setSuggestions([]);
    setHasSearched(false);
    setShowResults(false);
  };

  const activeFilterCount = [category, section, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => (query.length >= 2 || hasSearched) && setShowResults(true)}
            placeholder="Ürün, kategori veya marka ara..."
            className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
          />
          {(query || hasSearched) && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative h-11 px-3 rounded-xl border transition-all ${
            showFilters || activeFilterCount > 0
              ? 'border-orange-400 bg-orange-50 text-orange-600'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
          }`}
        >
          <SlidersHorizontal size={18} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="submit"
          className="h-11 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Ara</span>
        </button>
      </form>

      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="">Tümü</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Koleksiyon</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Min Fiyat (TL)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Max Fiyat (TL)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="9999"
              className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
        </div>
      )}

      {showResults && (suggestions.length > 0 || hasSearched) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-6 text-center text-sm text-gray-400">Aranıyor...</div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-50">
                  {results.length} sonuç bulundu
                </div>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/urun/${product.slug}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category_name}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      {formatPriceWithCurrency(Number(product.price))}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">Sonuç bulunamadı</div>
            )
          ) : (
            suggestions.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => { setQuery(s.name); handleSearch(); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50/50 transition-colors text-left"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={s.image_url} alt={s.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.category_name}</p>
                </div>
                <span className="text-sm font-semibold text-orange-500 shrink-0">
                  {formatPriceWithCurrency(Number(s.price))}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
