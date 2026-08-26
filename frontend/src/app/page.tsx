import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import CampaignNav from '@/components/CampaignNav';
import HeroBanner from '@/components/HeroBanner';
import PromoCarousel from '@/components/PromoCarousel';
import ProductSection from '@/components/ProductSection';
import Footer from '@/components/Footer';
import {
  getCategories,
  getCampaigns,
  getBanners,
  getPromoTiles,
  getProductSections,
  getLatestProducts,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getPageData() {
  const [categoriesRes, campaignsRes, bannersRes, promoTilesRes, sectionsRes, latestRes] =
    await Promise.all([
      getCategories(),
      getCampaigns(),
      getBanners(),
      getPromoTiles(),
      getProductSections(),
      getLatestProducts(12),
    ]);

  return {
    categories: categoriesRes.data,
    campaigns: campaignsRes.data,
    banners: bannersRes.data,
    promoTiles: promoTilesRes.data,
    sections: sectionsRes.data.filter((s) => s.products?.length > 0),
    latest: latestRes.data,
  };
}

export default async function HomePage() {
  let data;
  try {
    data = await getPageData();
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Şirin Kids</h1>
          <p className="text-gray-500 text-sm">
            Sunucuya bağlanılamıyor. Lütfen backend API&apos;nin çalıştığından emin olun.
          </p>
          <code className="block mt-4 text-xs bg-gray-100 px-4 py-2 rounded-lg text-gray-600">
            cd backend && npm run dev
          </code>
        </div>
      </div>
    );
  }

  const { categories, campaigns, banners, promoTiles, sections, latest } = data;

  return (
    <>
      <Header categories={categories} />
      <CategoryNav categories={categories} />
      <CampaignNav campaigns={campaigns} />

      <main>
        <HeroBanner banners={banners} />
        <PromoCarousel tiles={promoTiles} />

        {latest.length > 0 && (
          <ProductSection
            title="En Yeni"
            subtitle="Son eklenen ürünler"
            products={latest}
            sectionKey="en-yeni"
            seeAllHref="/koleksiyon/en-yeni"
          />
        )}

        {sections.map((section) => (
          <ProductSection
            key={section.key}
            title={section.title}
            subtitle={section.subtitle}
            products={section.products}
            sectionKey={section.key}
            seeAllHref={`/koleksiyon/${section.key}`}
          />
        ))}
      </main>

      <Footer />
    </>
  );
}
