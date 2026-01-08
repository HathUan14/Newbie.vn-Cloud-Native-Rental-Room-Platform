'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Ẩn Navbar và Footer cho các trang admin
  const isAdminRoute = pathname?.startsWith('/admin');
  // Host dashboard: hiện navbar, ẩn footer
  const isHostDashboard = pathname?.startsWith('/dashboard/host');

  if (isAdminRoute) {
    // Admin pages: chỉ render children (admin layout sẽ xử lý sidebar)
    return <>{children}</>;
  }

  if (isHostDashboard) {
    // Host dashboard: chỉ navbar, không footer
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Normal pages: render với Navbar và Footer
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
