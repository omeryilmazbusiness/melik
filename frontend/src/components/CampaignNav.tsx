import Link from 'next/link';
import type { Campaign } from '@/lib/types';

/** Kampanya slug → ürün section veya kategori eşlemesi */
const CAMPAIGN_LINKS: Record<string, string> = {
  'yeni-sezon': '/koleksiyon/yeni_sezon',
  'tek-fiyat': '/koleksiyon/tek_fiyat',
  'buyuk-indirim': '/koleksiyon/firsat_urunler',
  kampanyalar: '/koleksiyon/firsat_urunler',
  'okula-donus': '/kategori/erkek-cocuk',
};

interface CampaignNavProps {
  campaigns: Campaign[];
  activeSlug?: string;
}

export default function CampaignNav({ campaigns, activeSlug }: CampaignNavProps) {
  return (
    <div className="border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
          {campaigns.map((camp) => {
            const href = CAMPAIGN_LINKS[camp.slug] || `/kategori/${camp.slug}`;
            const isActive = activeSlug === camp.slug;

            return (
              <Link
                key={camp.slug}
                href={href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : camp.is_highlighted
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                      : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <span>{camp.icon}</span>
                {camp.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
