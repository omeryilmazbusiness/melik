export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface ProductSize {
  label: string;
  in_stock: boolean;
}

export interface ColorVariant {
  name: string;
  image_url: string;
}

export interface ProductFeature {
  key: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  subtitle?: string;
  description?: string;
  detail?: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  section: 'yeni_sezon' | 'firsat_urunler' | 'tek_fiyat';
  image_url: string;
  images?: string[];
  badge: string | null;
  age_range?: string;
  color?: string;
  brand?: string;
  model?: string;
  sizes?: ProductSize[];
  color_variants?: ColorVariant[];
  features?: ProductFeature[];
  in_stock?: boolean;
  category_name?: string;
  category_slug?: string;
}

export interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  image_url: string;
  badge: string | null;
  color?: string;
  category_name?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  badge_text: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface Campaign {
  id: number;
  name: string;
  slug: string;
  icon: string;
  is_highlighted: boolean;
}

export interface PromoTile {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
}

export interface ProductSection {
  key: string;
  title: string;
  subtitle: string;
  products: Product[];
}

export interface SearchSuggestion {
  name: string;
  slug: string;
  image_url: string;
  price: number;
  category_name: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}
