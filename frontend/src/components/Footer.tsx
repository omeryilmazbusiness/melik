import { Logo } from './Logo';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" variant="light" />
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Çocuklarınız için en kaliteli, en şık ve en konforlu giyim ürünleri.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Kategoriler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#kategori-bebek" className="hover:text-orange-400 transition-colors">Bebek</Link></li>
              <li><Link href="/#kategori-kiz-cocuk" className="hover:text-orange-400 transition-colors">Kız Çocuk</Link></li>
              <li><Link href="/#kategori-erkek-cocuk" className="hover:text-orange-400 transition-colors">Erkek Çocuk</Link></li>
              <li><Link href="/#kategori-outlet" className="hover:text-orange-400 transition-colors">Outlet</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hakkimizda" className="hover:text-orange-400 transition-colors">Hakkımızda</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">İade & Değişim</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">SSS</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">İletişim</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Bizi Takip Edin</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © 2026 Şirin Kids. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
