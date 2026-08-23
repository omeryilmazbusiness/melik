'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Upload,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminUploadImage,
  type BannerInput,
} from '@/lib/admin-api';
import type { Banner } from '@/lib/types';

/** Anasayfa hero banner görsel alanı ölçüleri */
const BANNER_IMAGE_SPECS = {
  width: 1200,
  height: 800,
  ratio: '3:2',
  label: '1200 × 800 px',
};

const emptyForm: BannerInput = {
  title: '',
  subtitle: '',
  cta_text: 'ALIŞVERİŞE BAŞLA',
  cta_link: '/#section-firsat_urunler',
  image_url: '',
  badge_text: '',
  sort_order: 0,
  is_active: true,
};

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BannerInput>(emptyForm);

  const load = () => {
    setLoading(true);
    adminGetBanners()
      .then((res) => setBanners(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const set = <K extends keyof BannerInput>(key: K, value: BannerInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: banners.length });
    setShowForm(true);
    setError('');
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      cta_text: banner.cta_text || 'ALIŞVERİŞE BAŞLA',
      cta_link: banner.cta_link || '/',
      image_url: banner.image_url || '',
      badge_text: banner.badge_text || '',
      sort_order: banner.sort_order ?? 0,
      is_active: banner.is_active !== false,
    });
    setShowForm(true);
    setError('');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminUploadImage(file);
      set('image_url', res.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Başlık gerekli');
    if (!form.image_url.trim()) return setError('Banner görseli gerekli');

    setSaving(true);
    try {
      const payload: BannerInput = {
        ...form,
        badge_text: form.badge_text || null,
        subtitle: form.subtitle || null,
      };
      if (editingId) {
        await adminUpdateBanner(editingId, payload);
      } else {
        await adminCreateBanner(payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" bannerını silmek istediğinize emin misiniz?`)) return;
    await adminDeleteBanner(id);
    load();
  };

  const toggleActive = async (banner: Banner) => {
    await adminUpdateBanner(banner.id, { is_active: !banner.is_active });
    load();
  };

  const inputClass =
    'w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bannerlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Anasayfa hero alanında görünen reklam bannerları
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={16} /> Yeni Banner
          </button>
        )}
      </div>

      {/* Ölçü rehberi */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-48 shrink-0">
          <div className="relative aspect-[3/2] rounded-xl border-2 border-dashed border-orange-300 bg-white overflow-hidden flex items-center justify-center">
            <div className="text-center px-2">
              <ImageIcon size={28} className="mx-auto text-orange-300 mb-1" />
              <p className="text-[10px] font-bold text-orange-500">{BANNER_IMAGE_SPECS.label}</p>
              <p className="text-[9px] text-orange-400">Oran {BANNER_IMAGE_SPECS.ratio}</p>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-900">Önerilen görsel ölçüleri</p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-500">
            <li>
              Ideal boyut: <strong className="text-gray-800">{BANNER_IMAGE_SPECS.label}</strong> (oran {BANNER_IMAGE_SPECS.ratio})
            </li>
            <li>Anasayfada bannerın sağ tarafında (masaüstü) veya altta (mobil) gösterilir</li>
            <li>JPG, PNG veya WebP — max 5 MB</li>
            <li>Aktif bannerlar sıralama numarasına göre listelenir; ilk aktif banner öne çıkar</li>
          </ul>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editingId ? 'Banner Düzenle' : 'Yeni Banner'}
            </h2>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Başlık *</label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={inputClass}
                placeholder="Yazın Son Fırsatları"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Alt Metin</label>
              <input
                value={form.subtitle || ''}
                onChange={(e) => set('subtitle', e.target.value)}
                className={inputClass}
                placeholder="Sezon sonu indirimlerinde %70'e varan fırsatlar"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Buton Yazısı</label>
              <input
                value={form.cta_text || ''}
                onChange={(e) => set('cta_text', e.target.value)}
                className={inputClass}
                placeholder="ALIŞVERİŞE BAŞLA"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Buton Linki</label>
              <input
                value={form.cta_link || ''}
                onChange={(e) => set('cta_link', e.target.value)}
                className={inputClass}
                placeholder="/koleksiyon/firsat_urunler"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Rozet Metni</label>
              <input
                value={form.badge_text || ''}
                onChange={(e) => set('badge_text', e.target.value)}
                className={inputClass}
                placeholder="1000 TL İndirim"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Sıra</label>
              <input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => set('sort_order', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Görsel yükleme — banner ölçü önizlemesi */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              Banner Görseli * <span className="text-orange-500">({BANNER_IMAGE_SPECS.label})</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-full sm:w-72 aspect-[3/2] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                {form.image_url ? (
                  <Image
                    src={form.image_url}
                    alt="Banner önizleme"
                    fill
                    className="object-cover"
                    sizes="288px"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={32} className="mb-2 opacity-40" />
                    <p className="text-xs">Önizleme</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1 w-full">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
                <input
                  value={form.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                  className={inputClass}
                  placeholder="veya görsel URL girin"
                />
                <p className="text-[11px] text-gray-400">
                  Görsel anasayfada bannerın sağ yarısında object-cover ile kırpılır. {BANNER_IMAGE_SPECS.ratio} oran önerilir.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.is_active !== false}
              onChange={(e) => set('is_active', e.target.checked)}
            />
            Aktif (anasayfada göster)
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-6 h-11 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Check size={16} />
              {saving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Yayınla'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="px-5 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ImageIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm mb-4">Henüz banner yok</p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl"
          >
            <Plus size={16} /> İlk Bannerı Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-white rounded-2xl border overflow-hidden flex flex-col sm:flex-row ${
                banner.is_active === false ? 'border-gray-100 opacity-60' : 'border-gray-100'
              }`}
            >
              <div className="relative w-full sm:w-56 aspect-[3/2] sm:aspect-auto sm:h-auto shrink-0 bg-gray-100">
                {banner.image_url && (
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="224px"
                  />
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                    {banner.is_active !== false ? (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full shrink-0">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                        Pasif
                      </span>
                    )}
                  </div>
                  {banner.subtitle && (
                    <p className="text-xs text-gray-400 line-clamp-1">{banner.subtitle}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    Sıra: {banner.sort_order ?? 0}
                    {banner.badge_text ? ` · Rozet: ${banner.badge_text}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleActive(banner)}
                    className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    {banner.is_active === false ? 'Aktifleştir' : 'Pasifleştir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(banner)}
                    className="p-2 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
