'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Tags, Megaphone, ImageIcon, LogOut, ExternalLink } from 'lucide-react';
import { clearAdminToken } from '@/lib/admin-auth';
import type { AdminUser } from '@/lib/admin-api';

const NAV = [
  { href: '/yonetim', label: 'Panel', icon: LayoutDashboard, exact: true },
  { href: '/yonetim/urunler', label: 'Ürünler', icon: Package },
  { href: '/yonetim/bannerlar', label: 'Bannerlar', icon: ImageIcon },
  { href: '/yonetim/kategoriler', label: 'Kategoriler', icon: Tags },
  { href: '/yonetim/kampanyalar', label: 'Kampanyalar', icon: Megaphone },
];

interface AdminShellProps {
  admin: AdminUser;
  children: React.ReactNode;
}

export default function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearAdminToken();
    router.push('/yonetim/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <p className="text-white font-bold text-lg">Şirin Kids</p>
          <p className="text-xs text-gray-500 mt-0.5">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-orange-500 text-white' : 'hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ExternalLink size={18} />
            Siteyi Görüntüle
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
          <p className="px-3 pt-2 text-xs text-gray-500">{admin.name}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
