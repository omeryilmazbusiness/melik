import { getAdminToken, clearAdminToken } from './admin-auth';
import type { Category, Campaign, Product, ProductFeature, ProductSize, ColorVariant } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface AdminUser {
  id: number;
  username: string;
  name: string;
}

export interface ProductSectionOption {
  key: string;
  title: string;
  subtitle: string;
}

export interface ProductInput {
  name: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  detail?: string;
  price: number;
  original_price?: number | null;
  section: string | null;
  category_id?: number | null;
  image_url: string;
  images?: string[];
  badge?: string | null;
  age_range?: string;
  color?: string;
  brand?: string;
  model?: string;
  sizes?: ProductSize[];
  color_variants?: ColorVariant[];
  features?: ProductFeature[];
  in_stock?: boolean;
  is_featured?: boolean;
}

async function adminFetch<T>(endpoint: string, options: RequestInit = {}, skipAuthRedirect = false): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (res.status === 401) {
    if (!skipAuthRedirect) {
      clearAdminToken();
      if (typeof window !== 'undefined') window.location.href = '/yonetim/login';
    }
    throw new Error(json.error || 'Yetkilendirme hatası');
  }

  if (!res.ok) throw new Error(json.error || 'İstek başarısız');
  return json;
}

export async function adminLogin(username: string, password: string) {
  return adminFetch<{ data: { token: string; admin: AdminUser } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    true
  );
}

export async function adminMe() {
  return adminFetch<{ data: AdminUser }>('/auth/me');
}

export async function adminGetSections() {
  return adminFetch<{ data: ProductSectionOption[] }>('/products/sections');
}

export async function adminGetCategories() {
  return adminFetch<{ data: Category[] }>('/categories');
}

export async function adminCreateCategory(data: Partial<Category>) {
  return adminFetch<{ data: Category }>('/categories', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateCategory(id: number, data: Partial<Category>) {
  return adminFetch<{ data: Category }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteCategory(id: number) {
  return adminFetch<{ data: { success: boolean } }>(`/categories/${id}`, { method: 'DELETE' });
}

export async function adminGetCampaigns() {
  return adminFetch<{ data: Campaign[] }>('/campaigns');
}

export async function adminCreateCampaign(data: Partial<Campaign & { sort_order?: number }>) {
  return adminFetch<{ data: Campaign }>('/campaigns', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateCampaign(id: number, data: Partial<Campaign & { sort_order?: number }>) {
  return adminFetch<{ data: Campaign }>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteCampaign(id: number) {
  return adminFetch<{ data: { success: boolean } }>(`/campaigns/${id}`, { method: 'DELETE' });
}

export async function adminGetProducts(params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  return adminFetch<{ data: Product[]; meta: { total: number } }>(`/products${query}`);
}

export async function adminGetProduct(id: number) {
  return adminFetch<{ data: Product }>(`/products/${id}`);
}

export async function adminCreateProduct(data: ProductInput) {
  return adminFetch<{ data: Product }>('/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateProduct(id: number, data: Partial<ProductInput>) {
  return adminFetch<{ data: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteProduct(id: number) {
  return adminFetch<{ data: { success: boolean } }>(`/products/${id}`, { method: 'DELETE' });
}

export async function adminUploadImage(file: File) {
  const form = new FormData();
  form.append('image', file, file.name);

  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const json = await res.json();

  if (res.status === 401) {
    clearAdminToken();
    if (typeof window !== 'undefined') window.location.href = '/yonetim/login';
    throw new Error(json.error || 'Oturum süresi doldu');
  }

  if (!res.ok) throw new Error(json.error || 'Görsel yüklenemedi');
  return json as { data: { url: string; filename: string } };
}

export interface BannerInput {
  title: string;
  subtitle?: string | null;
  cta_text?: string;
  cta_link?: string;
  image_url: string;
  badge_text?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export async function adminGetBanners() {
  return adminFetch<{ data: import('./types').Banner[] }>('/banners');
}

export async function adminCreateBanner(data: BannerInput) {
  return adminFetch<{ data: import('./types').Banner }>('/banners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateBanner(id: number, data: Partial<BannerInput>) {
  return adminFetch<{ data: import('./types').Banner }>(`/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteBanner(id: number) {
  return adminFetch<{ data: { success: boolean } }>(`/banners/${id}`, { method: 'DELETE' });
}
