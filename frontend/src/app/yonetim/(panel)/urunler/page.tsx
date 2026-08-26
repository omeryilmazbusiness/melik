'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminGetProducts, adminDeleteProduct } from '@/lib/admin-api';
import type { Product } from '@/lib/types';
import { formatPriceWithCurrency } from '@/lib/format';

const SECTION_LABELS: Record<string, string> = {
  yeni_sezon: 'Yeni Sezon',
  firsat_urunler: 'Fırsat Ürünler',
  tek_fiyat: 'Tek Fiyat',
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetProducts()
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;
    await adminDeleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} ürün</p>
        </div>
        <Link href="/yonetim/urunler/yeni" className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={16} /> Yeni Ürün
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Ürün</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Koleksiyon</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Fiyat</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category_name}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-medium">
                      {p.section ? (SECTION_LABELS[p.section] || p.section) : 'Kampanya yok'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatPriceWithCurrency(Number(p.price))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/yonetim/urunler/${p.id}`} className="p-2 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors">
                        <Pencil size={16} />
                      </Link>
                      <button type="button" onClick={() => handleDelete(p.id, p.name)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
