'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Wallet, History, Bell, User, ArrowLeft } from 'lucide-react';
import AdminDashboardLink from '@/components/dashboard/AdminDashboardLink';
import SignOutButton from '@/components/SignOutButton';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/buy-lots', label: 'Buy Lots', icon: PlusCircle },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/dashboard/payouts', label: 'History', icon: History },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Mobile Header */}
      <header className="lg:hidden bg-[#1a2e1a] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="FarmDirect"
              width={96}
              height={32}
            />
          </Link>
          <span className="text-lg font-semibold text-white">Dashboard</span>
          <AdminDashboardLink compact />        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:w-64 bg-[#1a2e1a] border-r border-white/10 min-h-screen sticky top-0 flex-col">
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="FarmDirect"
                width={120}
                height={40}
              />
            </Link>
          </div>
          <nav className="p-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <AdminDashboardLink />
          <div className="p-4 border-t border-white/10 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="px-4 py-3 border-t border-white/10">
              <SignOutButton variant="red" className="w-full" />
            </div>
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#d8f3dc] z-40">
          <div className="grid grid-cols-5">
            {navItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                    isActive ? 'text-[#2d6a4f]' : 'text-[#95d5b2]'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/dashboard/profile"
              className={`flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                pathname === '/dashboard/profile' ? 'text-[#2d6a4f]' : 'text-[#95d5b2]'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}