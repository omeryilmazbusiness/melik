'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/admin-auth';
import { adminMe } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/admin-api';
import AdminShell from './AdminShell';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/yonetim/login');
      return;
    }

    adminMe()
      .then((res) => setAdmin(res.data))
      .catch(() => router.replace('/yonetim/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) return null;
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
