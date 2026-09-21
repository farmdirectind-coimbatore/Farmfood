'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Users, FileText, Calendar, Building2, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/verification', label: 'Verification', icon: FileText },
  { href: '/admin/payouts', label: 'Daily Payouts', icon: Calendar },
  { href: '/admin/bank-details', label: 'Bank Details', icon: Building2 },
  { href: '/admin/audit', label: 'Audit Log', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // Login page is standalone — no header/sidebar chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-[#1a2e1a] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="FarmDirect"
                width={96}
                height={32}
              />
            </Link>
            <span className="text-lg font-semibold text-white">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-xl font-medium hover:bg-white/20 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#d8f3dc] min-h-[calc(100vh-64px)] sticky top-16 hidden lg:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] font-semibold'
                      : 'text-[#52796f] hover:bg-[#f0f7f0]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#d8f3dc] z-40 overflow-x-auto">
          <div className="flex min-w-max">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                    isActive ? 'text-[#2d6a4f]' : 'text-[#95d5b2]'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto pb-20 lg:pb-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}