import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import CampaignNav from '@/components/CampaignNav';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getCategories, getCampaigns, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { data: categories } = await getCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return { title: 'Kategori | Şirin Kids' };
    return {
      title: `${category.name} | Şirin Kids`,
      description: `${category.name} kategorisindeki ürünler — Şirin Kids çocuk giyim.`,
    };
  } catch {
    return { title: 'Kategori | Şirin Kids' };
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  let categories;
  let campaigns;
  let products;
  let category;

  try {
    const [categoriesRes, campaignsRes, productsRes] = await Promise.all([
      getCategories(),
      getCampaigns(),
      getProducts({ category: slug, limit: '100', sort: 'created_at' }),
    ]);

    categories = categoriesRes.data;
    campaigns = campaignsRes.data;
    products = productsRes.data;
    category = categories.find((c) => c.slug === slug);
  } catch {
    notFound();
  }

  if (!category) notFound();

  return (
    <>
      <Header categories={categories} />
      <CategoryNav categories={categories} activeSlug={slug} />
      <CampaignNav campaigns={campaigns} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-500 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-gray-600">{category.name}</span>
        </nav>

        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.name}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {products.length} ürün listeleniyor
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-sm mb-4">Bu kategoride henüz ürün yok.</p>
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
