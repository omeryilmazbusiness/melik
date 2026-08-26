'use client';

import { useEffect, useState } from 'react';
import AppImage from '@/components/AppImage';
import { Plus, Upload, Loader2 } from 'lucide-react';
import {
  adminGetCategories,
  adminGetSections,
  adminGetBanners,
  adminUploadImage,
  type ProductInput,
} from '@/lib/admin-api';
import type { Category, ProductFeature, ProductSize, ColorVariant, Banner } from '@/lib/types';
import type { ProductSectionOption } from '@/lib/admin-api';

const DEFAULT_SIZES_BABY: ProductSize[] = [
  { label: '0-3 Ay', in_stock: true },
  { label: '3-6 Ay', in_stock: true },
  { label: '6-9 Ay', in_stock: true },
  { label: '9-12 Ay', in_stock: true },
  { label: '12-18 Ay', in_stock: true },
  { label: '18-24 Ay', in_stock: false },
];

const DEFAULT_SIZES_KIDS: ProductSize[] = [
  { label: '2-3 Yaş', in_stock: true },
  { label: '3-4 Yaş', in_stock: true },
  { label: '4-5 Yaş', in_stock: true },
  { label: '5-6 Yaş', in_stock: true },
  { label: '6-7 Yaş', in_stock: false },
  { label: '7-8 Yaş', in_stock: true },
];

const INPUT = 'w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400';
const TEXTAREA = 'w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none';

const DEFAULT_FEATURES: ProductFeature[] = [
  { key: 'Kumaş', value: '%100 Pamuk' },
  { key: 'Yıkama', value: '30°C makinede yıkanabilir' },
  { key: 'Menşei', value: 'Türkiye' },
  { key: 'Sezon', value: '2026 Yaz/Kış' },
];

interface ProductFormProps {
  initial?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => Promise<void>;
  submitLabel?: string;
}

export default function ProductForm({ initial, onSubmit, submitLabel = 'Kaydet' }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<ProductSectionOption[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ProductInput>({
    name: initial?.name || '',
    subtitle: initial?.subtitle || '',
    description: initial?.description || initial?.detail || '',
    detail: initial?.detail || initial?.description || '',
    price: initial?.price || 0,
    original_price: initial?.original_price ?? null,
    section: initial?.section ?? '',
    category_id: initial?.category_id ?? null,
    banner_id: initial?.banner_id ?? null,
    image_url: initial?.image_url || '',
    images: initial?.images || [],
    badge: initial?.badge ?? null,
    age_range: initial?.age_range || '',
    color: initial?.color || '',
    brand: initial?.brand || 'Şirin Kids',
    model: initial?.model || '',
    sizes: initial?.sizes || DEFAULT_SIZES_KIDS,
    color_variants: initial?.color_variants || [],
    features: initial?.features || DEFAULT_FEATURES,
    in_stock: initial?.in_stock !== false,
    is_featured: initial?.is_featured === true,
  });

  useEffect(() => {
    Promise.all([adminGetCategories(), adminGetSections(), adminGetBanners()]).then(
      ([catRes, secRes, banRes]) => {
        setCategories(catRes.data);
        setSections(secRes.data);
        setBanners(banRes.data.filter((b) => b.is_active !== false));
      }
    );
  }, []);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminUploadImage(file);
      set('image_url', res.data.url);
      if (!form.images?.length) set('images', [res.data.url]);
      if (form.color) {
        set('color_variants', [{ name: form.color, image_url: res.data.url }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    set('category_id', categoryId);
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.slug === 'bebek') set('sizes', DEFAULT_SIZES_BABY);
    else set('sizes', DEFAULT_SIZES_KIDS);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: string | boolean) => {
    const sizes = [...(form.sizes || [])];
    sizes[index] = { ...sizes[index], [field]: value };
    set('sizes', sizes);
  };

  const updateFeature = (index: number, field: keyof ProductFeature, value: string) => {
    const features = [...(form.features || [])];
    features[index] = { ...features[index], [field]: value };
    set('features', features);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Ürün adı gerekli');
    if (!form.image_url) return setError('Görsel gerekli');
    if (!form.price) return setError('Fiyat gerekli');

    setLoading(true);
    try {
      const images = form.images?.length ? form.images : [form.image_url];
      const colorVariants: ColorVariant[] = form.color_variants?.length
        ? form.color_variants
        : form.color
          ? [{ name: form.color, image_url: form.image_url }]
          : [];

      await onSubmit({
        ...form,
        section: form.section || null,
        banner_id: form.banner_id || null,
        images,
        color_variants: colorVariants,
        detail: form.detail || form.description,
        description: form.description || form.detail,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Ürün Adı *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={INPUT} required />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Alt Başlık</label>
            <input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} className={INPUT} placeholder="Gömlek Yaka - Polo Tulum" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Marka</label>
            <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Model Kodu</label>
            <input value={form.model} onChange={(e) => set('model', e.target.value)} className={INPUT} placeholder="SK-TT-001" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Kategori & Kampanya</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Kategori *</label>
            <select
              value={form.category_id ?? ''}
              onChange={(e) => handleCategoryChange(Number(e.target.value))}
              className={INPUT}
              required
            >
              <option value="">Seçiniz</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Kampanya</label>
            <select
              value={form.section ?? ''}
              onChange={(e) => set('section', e.target.value || null)}
              className={INPUT}
            >
              <option value="">Kampanya yok</option>
              {sections.map((s) => (
                <option key={s.key} value={s.key}>{s.title}</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">Boş bırakılırsa ana sayfa kampanya bölümlerinde görünmez</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Banner</label>
            <select
              value={form.banner_id ?? ''}
              onChange={(e) => set('banner_id', e.target.value ? Number(e.target.value) : null)}
              className={INPUT}
            >
              <option value="">Banner yok</option>
              {banners.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Seçilirse müşteri o banner’a tıkladığında bu ürün listelenir
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Fiyat</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Satış Fiyatı (TL) *</label>
            <input type="number" step="0.01" min="0" value={form.price || ''} onChange={(e) => set('price', Number(e.target.value))} className={INPUT} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Liste Fiyatı (TL)</label>
            <input type="number" step="0.01" min="0" value={form.original_price ?? ''} onChange={(e) => set('original_price', e.target.value ? Number(e.target.value) : null)} className={INPUT} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Rozet</label>
            <input value={form.badge ?? ''} onChange={(e) => set('badge', e.target.value || null)} className={INPUT} placeholder="Süper Fiyat, Yeni..." />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Görsel *</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {form.image_url && (
            <div className="relative w-32 h-40 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <AppImage src={form.image_url} alt="Önizleme" fill className="object-cover" sizes="128px" />
            </div>
          )}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium cursor-pointer transition-colors">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} className={INPUT} placeholder="veya görsel URL girin" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Varyantlar</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Renk</label>
            <input value={form.color} onChange={(e) => set('color', e.target.value)} className={INPUT} placeholder="Yeşil, Pembe..." />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Yaş Aralığı</label>
            <input value={form.age_range} onChange={(e) => set('age_range', e.target.value)} className={INPUT} placeholder="6-18 Ay" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Bedenler</label>
          <div className="space-y-2">
            {(form.sizes || []).map((size, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={size.label} onChange={(e) => updateSize(i, 'label', e.target.value)} className="input flex-1" />
                <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                  <input type="checkbox" checked={size.in_stock} onChange={(e) => updateSize(i, 'in_stock', e.target.checked)} />
                  Stokta
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Ürün Detayı</h2>
        <textarea
          value={form.description}
          onChange={(e) => { set('description', e.target.value); set('detail', e.target.value); }}
          rows={4}
          className={TEXTAREA}
          placeholder="Ürün açıklaması..."
        />

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Özellikler</label>
          {(form.features || []).map((f, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={f.key} onChange={(e) => updateFeature(i, 'key', e.target.value)} className="input flex-1" placeholder="Özellik" />
              <input value={f.value} onChange={(e) => updateFeature(i, 'value', e.target.value)} className="input flex-1" placeholder="Değer" />
            </div>
          ))}
          <button type="button" onClick={() => set('features', [...(form.features || []), { key: '', value: '' }])} className="text-xs text-orange-500 font-medium flex items-center gap-1 mt-1">
            <Plus size={14} /> Özellik Ekle
          </button>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.in_stock} onChange={(e) => set('in_stock', e.target.checked)} />
            Stokta
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
            Öne Çıkar
          </label>
        </div>
      </section>

      <button type="submit" disabled={loading || uploading} className="w-full sm:w-auto px-8 h-11 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
        {loading ? 'Kaydediliyor...' : submitLabel}
      </button>
    </form>
  );
}
