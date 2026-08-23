'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

const REDIRECT_SECONDS = 10;

export default function NotFound() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (seconds <= 0) {
      router.replace('/');
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, router]);

  const progress = ((REDIRECT_SECONDS - seconds) / REDIRECT_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/80 via-white to-white flex flex-col">
      <header className="px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="text-center max-w-md w-full">
          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="text-[7rem] sm:text-[9rem] font-black text-orange-100 leading-none select-none">
              404
            </span>
            <span className="absolute text-5xl" aria-hidden="true">🧸</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Sayfa bulunamadı
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
            Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
            <br />
            <span className="text-orange-500 font-medium">
              {seconds} saniye
            </span>
            {' '}içinde ana sayfaya yönlendirileceksiniz.
          </p>

          <div className="w-full max-w-xs mx-auto mb-8">
            <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm shadow-orange-200"
            >
              <Home size={16} />
              Ana Sayfaya Git
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-600 font-medium rounded-xl border border-gray-200 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Geri Dön
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
