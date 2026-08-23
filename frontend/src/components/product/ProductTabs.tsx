'use client';

import { useState } from 'react';
import type { Product, ProductFeature } from '@/lib/types';

interface ProductTabsProps {
  product: Product;
}

const TABS = [
  { key: 'detail', label: 'Detay' },
  { key: 'features', label: 'Ürün Özellikleri' },
  { key: 'installments', label: 'Taksit Seçenekleri' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('detail');

  const features: ProductFeature[] = Array.isArray(product.features)
    ? product.features
    : typeof product.features === 'string'
      ? JSON.parse(product.features)
      : [];

  return (
    <div className="mt-10 border-t border-gray-100 pt-6">
      <div className="flex gap-6 border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab.key
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="py-6 text-sm text-gray-600 leading-relaxed">
        {activeTab === 'detail' && (
          <p>{product.detail || product.description || 'Ürün detayı yakında eklenecek.'}</p>
        )}

        {activeTab === 'features' && (
          <dl className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.key} className="flex justify-between sm:block gap-4 py-2 border-b border-gray-50">
                <dt className="text-gray-400 font-medium">{f.key}</dt>
                <dd className="text-gray-800 font-medium sm:mt-1">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {activeTab === 'installments' && (
          <div className="space-y-3">
            {[
              { bank: 'Bonus', installments: '3 x ' + (Number(product.price) / 3).toFixed(2) + ' TL' },
              { bank: 'World', installments: '6 x ' + (Number(product.price) / 6).toFixed(2) + ' TL' },
              { bank: 'Maximum', installments: '9 x ' + (Number(product.price) / 9).toFixed(2) + ' TL' },
            ].map((item) => (
              <div key={item.bank} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">{item.bank}</span>
                <span className="font-medium text-gray-800">{item.installments}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
