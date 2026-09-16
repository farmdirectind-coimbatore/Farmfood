'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useSupabaseSession } from '@/components/SupabaseSessionProvider';
import SignOutButton from '@/components/SignOutButton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact', label: 'Contact' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const { session, isLoading } = useSupabaseSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a2e1a] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={session ? '/dashboard' : '/'} className="flex items-center flex-shrink-0" aria-label="FarmDirect">
          <img src="/images/logo.png" alt="FarmDirect" className="h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth button */}
        <div className="flex-shrink-0">
          {!isLoading &&
            (session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1a2e1a] text-sm font-semibold shadow-md hover:bg-white/90 hover:shadow-lg transition-all active:scale-[0.97]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <SignOutButton variant="light" label="" className="px-3" />
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-[#1a2e1a] text-sm font-semibold shadow-md hover:bg-white/90 hover:shadow-lg transition-all active:scale-[0.97]"
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}