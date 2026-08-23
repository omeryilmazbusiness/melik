import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Şirin Kids | Çocuk Giyim',
  description: 'Şirin Kids - Çocuklarınız için modern, kaliteli ve şık giyim ürünleri. Yeni sezon, fırsat ürünler ve tek fiyat kampanyaları.',
  keywords: ['çocuk giyim', 'bebek kıyafetleri', 'şirin kids', 'yeni sezon', 'outlet'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
