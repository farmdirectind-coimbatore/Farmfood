import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  invest: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Start Investing', href: '/login' },
    { label: 'Risk Disclosure', href: '/risk-disclosure' },
  ],
  farm: [
    { label: 'Our Farm', href: '/#the-farm' },
    { label: 'Visit Us', href: '/contact' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Risk Disclosure', href: '/risk-disclosure' },
  ],
};

export default function PublicFooter() {
  return (
    <footer className="bg-[#1a2e1a] pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/images/logo.png" alt="FarmDirect" className="h-10 w-auto" />
              <span className="font-display text-xl font-bold text-white">FarmDirect</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              A working farm in Coimbatore combining agriculture, livestock, hospitality, and agro-tourism — with revenue shared directly with our investors.
            </p>
          </div>

          {/* Invest */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Invest</h4>
            <ul className="space-y-2.5">
              {footerLinks.invest.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Farm */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Farm</h4>
            <ul className="space-y-2.5">
              {footerLinks.farm.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+919840830369" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +91 98408 30369
                </a>
              </li>
              <li>
                <a href="mailto:farmdirect.ind@gmail.com" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  farmdirect.ind@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Coimbatore, Tamil Nadu
              </li>
            </ul>
          </div>
        </div>

        {/* Risk disclaimer */}
        <div className="border-t border-white/10 pt-8">
          <div className="bg-white/5 rounded-2xl p-4 mb-8">
            <p className="text-white/50 text-xs leading-relaxed text-center">
              <strong className="text-white/70">Risk Disclosure:</strong> FarmDirect is a farm revenue-sharing product, not a guaranteed bank deposit or financial instrument. Returns depend on actual farm revenue and may vary. Read the{' '}
              <Link href="/risk-disclosure" className="underline hover:text-white/80 transition-colors">full risk disclosure</Link>
              {' '}before investing. Past performance does not guarantee future results.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} FarmDirect Agro Ventures. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link key={link.href} href={link.href} className="text-white/40 hover:text-white/70 text-xs transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}