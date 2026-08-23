import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductTabs from '@/components/product/ProductTabs';
import RelatedProducts from '@/components/product/RelatedProducts';
import { getCategories, getProduct, getRelatedProducts } from '@/lib/api';
import type { Product } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function parseImages(product: Product): string[] {
  if (Array.isArray(product.images) && product.images.length) return product.images;
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch { /* ignore */ }
  }
  return [product.image_url];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { data: product } = await getProduct(slug);
    return {
      title: `${product.name} | Şirin Kids`,
      description: product.subtitle || product.description,
    };
  } catch {
    return { title: 'Ürün Bulunamadı | Şirin Kids' };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Product;
  let related: Awaited<ReturnType<typeof getRelatedProducts>>['data'];
  let categories;

  try {
    const [productRes, relatedRes, categoriesRes] = await Promise.all([
      getProduct(slug),
      getRelatedProducts(slug),
      getCategories(),
    ]);
    product = productRes.data;
    related = relatedRes.data;
    categories = categoriesRes.data;
  } catch {
    notFound();
  }

  const images = parseImages(product);
  const breadcrumbs = [
    { label: 'Ana Sayfa', href: '/' },
    { label: product.category_name || 'Ürünler', href: '/' },
    { label: product.name, href: null },
  ];

  return (
    <>
      <Header categories={categories} />
      <CategoryNav categories={categories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5 whitespace-nowrap">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-orange-500 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-600 truncate max-w-[200px] sm:max-w-none">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery images={images} name={product.name} />
          <ProductInfo product={product} />
        </div>

        <ProductTabs product={product} />
        <RelatedProducts products={related} />
      </main>

      <Footer />
    </>
  );
}
