import AdminGuard from '@/components/admin/AdminGuard';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
