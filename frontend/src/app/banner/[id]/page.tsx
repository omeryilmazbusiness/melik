import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import AppImage from '@/components/AppImage';
import { getCategories, getBannerProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const { data } = await getBannerProducts(id);
    return {
      title: `${data.banner.title} | Şirin Kids`,
      description: data.banner.subtitle || undefined,
    };
  } catch {
    return { title: 'Banner | Şirin Kids' };
  }
}

export default async function BannerProductsPage({ params }: PageProps) {
  const { id } = await params;

  let categories;
  let banner;
  let products;

  try {
    const [categoriesRes, bannerRes] = await Promise.all([
      getCategories(),
      getBannerProducts(id),
    ]);
    categories = categoriesRes.data;
    banner = bannerRes.data.banner;
    products = bannerRes.data.products;
  } catch {
    notFound();
  }

  return (
    <>
      <Header categories={categories} />
      <CategoryNav categories={categories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-500 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-gray-600">{banner.title}</span>
        </nav>

        <div className="relative overflow-hidden rounded-3xl bg-gray-100 mb-8 min-h-[160px] sm:min-h-[200px]">
          {banner.image_url && (
            <AppImage
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
          <div className="relative z-10 p-6 sm:p-10 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{banner.title}</h1>
            {banner.subtitle && (
              <p className="text-white/80 text-sm sm:text-base mt-2">{banner.subtitle}</p>
            )}
            <p className="text-white/70 text-xs mt-3">{products.length} ürün</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm mb-4">Bu banner’a henüz ürün atanmamış.</p>
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
