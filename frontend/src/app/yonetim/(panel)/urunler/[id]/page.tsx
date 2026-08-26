'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { adminGetProduct, adminUpdateProduct } from '@/lib/admin-api';
import type { ProductInput } from '@/lib/admin-api';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<ProductInput> | null>(null);

  useEffect(() => {
    adminGetProduct(Number(id)).then((res) => {
      const p = res.data;
      setInitial({
        name: p.name,
        subtitle: p.subtitle,
        description: p.description,
        detail: p.detail,
        price: Number(p.price),
        original_price: p.original_price ? Number(p.original_price) : null,
        section: p.section,
        category_id: (p as { category_id?: number }).category_id,
        banner_id: p.banner_id ?? null,
        image_url: p.image_url,
        images: Array.isArray(p.images) ? p.images : [],
        badge: p.badge,
        age_range: p.age_range,
        color: p.color,
        brand: p.brand,
        model: p.model,
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        color_variants: Array.isArray(p.color_variants) ? p.color_variants : [],
        features: Array.isArray(p.features) ? p.features : [],
        in_stock: p.in_stock,
        is_featured: (p as { is_featured?: boolean }).is_featured,
      });
    });
  }, [id]);

  if (!initial) {
    return <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ürün Düzenle</h1>
      <ProductForm
        initial={initial}
        submitLabel="Güncelle"
        onSubmit={async (data) => {
          await adminUpdateProduct(Number(id), data);
          router.push('/yonetim/urunler');
        }}
      />
    </div>
  );
}
