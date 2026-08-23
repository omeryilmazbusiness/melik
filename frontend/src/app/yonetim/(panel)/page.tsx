'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Tags, Megaphone, Plus, ImageIcon } from 'lucide-react';
import { adminGetProducts, adminGetCategories, adminGetCampaigns, adminGetBanners } from '@/lib/admin-api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, campaigns: 0, banners: 0 });

  useEffect(() => {
    Promise.all([
      adminGetProducts(),
      adminGetCategories(),
      adminGetCampaigns(),
      adminGetBanners(),
    ]).then(([p, c, k, b]) =>
      setStats({
        products: p.meta.total,
        categories: c.data.length,
        campaigns: k.data.length,
        banners: b.data.length,
      })
    );
  }, []);

  const cards = [
    { label: 'Ürünler', value: stats.products, href: '/yonetim/urunler', icon: Package, color: 'bg-orange-500' },
    { label: 'Bannerlar', value: stats.banners, href: '/yonetim/bannerlar', icon: ImageIcon, color: 'bg-pink-500' },
    { label: 'Kategoriler', value: stats.categories, href: '/yonetim/kategoriler', icon: Tags, color: 'bg-blue-500' },
    { label: 'Kampanyalar', value: stats.campaigns, href: '/yonetim/kampanyalar', icon: Megaphone, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Hoş Geldiniz</h1>
      <p className="text-sm text-gray-500 mb-8">Şirin Kids yönetim paneli</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, href, icon: Icon, color }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/yonetim/urunler/yeni" className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus size={16} /> Yeni Ürün Ekle
          </Link>
          <Link href="/yonetim/bannerlar" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Banner Yönet
          </Link>
          <Link href="/yonetim/kategoriler" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Kategori Ekle
          </Link>
          <Link href="/yonetim/kampanyalar" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Kampanya Ekle
          </Link>
        </div>
      </div>
    </div>
  );
}
