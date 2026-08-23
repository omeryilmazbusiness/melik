'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { adminCreateProduct } from '@/lib/admin-api';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Ürün Ekle</h1>
      <ProductForm
        submitLabel="Yayınla"
        onSubmit={async (data) => {
          await adminCreateProduct(data);
          router.push('/yonetim/urunler');
        }}
      />
    </div>
  );
}
