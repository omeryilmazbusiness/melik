import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Hakkımızda | Şirin Kids',
  description: 'Şirin Kids - Çocuklarınız için kaliteli, şık ve konforlu giyim.',
};

export default function AboutPage() {
  return (
    <>
      <Header categories={[]} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Hakkımızda</h1>
        </div>

        <div className="prose prose-gray max-w-none space-y-5 text-gray-600 leading-relaxed text-sm sm:text-base">
          <p>
            <strong className="text-gray-900">Şirin Kids</strong>, çocuklarınızın konforunu ve şıklığını
            bir araya getiren premium çocuk giyim markasıdır. Bebek, kız ve erkek çocuk koleksiyonlarımızla
            her yaşa uygun, kaliteli ve uygun fiyatlı ürünler sunuyoruz.
          </p>
          <p>
            Tüm ürünlerimiz %100 pamuk ve nefes alabilir kumaşlardan üretilmektedir. Bebeğinizin hassas
            cildine uygun, yumuşak dokulu kıyafetler tasarlıyor; her parçayı özenle seçiyoruz.
          </p>
          <p>
            Yeni sezon koleksiyonlarımız, fırsat ürünlerimiz ve tek fiyat kampanyalarımızla ailelerin
            gardırobunu güncel tutmayı hedefliyoruz. Siparişleriniz WhatsApp üzerinden hızlı ve güvenilir
            şekilde alınmaktadır.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Alışverişe Başla
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
