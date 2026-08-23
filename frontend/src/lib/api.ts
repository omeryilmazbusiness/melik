const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit & { cache?: RequestCache }): Promise<T> {
  const { cache, ...fetchOptions } = options || {};
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    cache: cache ?? 'default',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

async function fetchApiServer<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function getCategories() {
  return fetchApiServer<{ data: import('./types').Category[] }>('/categories');
}

export async function getProducts(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  return fetchApiServer<{ data: import('./types').Product[]; meta: { total: number } }>(`/products${query}`);
}

export async function getProductSections() {
  return fetchApiServer<{ data: import('./types').ProductSection[] }>('/products/sections');
}

export async function getBanners() {
  return fetchApiServer<{ data: import('./types').Banner[] }>('/banners');
}

export async function getCampaigns() {
  return fetchApiServer<{ data: import('./types').Campaign[] }>('/campaigns');
}

export async function getPromoTiles() {
  return fetchApiServer<{ data: import('./types').PromoTile[] }>('/promo-tiles');
}

export async function searchProducts(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return fetchApi<{ data: import('./types').Product[]; meta: Record<string, unknown> }>(`/search?${query}`, { cache: 'no-store' });
}

export async function getSearchSuggestions(q: string) {
  return fetchApi<{ data: import('./types').SearchSuggestion[] }>(`/search/suggestions?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
}

export async function getProduct(slug: string) {
  return fetchApiServer<{ data: import('./types').Product }>(`/products/${slug}`);
}

export async function getRelatedProducts(slug: string) {
  return fetchApiServer<{ data: import('./types').RelatedProduct[] }>(`/products/${slug}/related`);
}
