import type { Metadata } from 'next';
import {
  Leaf, Fish, Coffee, MapPin, Users, Utensils,
  TreePine, Factory, Package, Sunrise, ArrowRight,
  TrendingUp, Shield, CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { APP_CONSTANTS } from '@/lib/constants';
import HomeCalculatorSection from './HomeCalculatorSection';

export const metadata: Metadata = {
  title: 'FarmDirect - Fresh Farm Investment Platform',
  description: 'Invest in a real working farm in Coimbatore. 1 lot = ₹10,000. Earn 1% daily returns on weekdays for 249 days. Farm produce, livestock, hut restaurant, and agro-tourism.',
};

const revenueStreams = [
  {
    icon: Leaf,
    title: 'Our Farm Produce',
    desc: 'Vegetables and fruits grown on-site and harvested fresh daily. Sold directly to visitors at farm-gate prices — no middlemen.',
    image: '/images/hero-vegetables.png',
  },
  {
    icon: Users,
    title: 'Partner Farmer Produce',
    desc: 'Additional fruits and vegetables from our network of 200+ local farmers, sold through shops inside the property.',
    image: '/images/farmer-field.png',
  },
  {
    icon: Fish,
    title: 'Fresh Livestock',
    desc: 'Fish, chicken, and rabbit raised responsibly on the land. Fresh, ethically sourced protein available for purchase.',
    image: '/images/fresh livestock.png',
  },
  {
    icon: Coffee,
    title: 'Coconut Water & Farm Drinks',
    desc: 'Fresh tender coconut water straight from the tree, plus traditional snacks and drinks made from our own produce.',
    image: '/images/coconutwater & farm drinks.png',
  },
  {
    icon: Utensils,
    title: 'Old-Styled Hut Restaurant',
    desc: 'Authentic cuisine served in an old-style hut setting — farm-fresh ingredients cooked the traditional way.',
    image: '/images/kera-style hut restaurant.png',
  },
  {
    icon: Factory,
    title: 'Wholesale Distribution',
    desc: 'Surplus produce sold to outside shops and markets — an additional revenue stream that ensures zero waste.',
    image: '/images/wholesale-hub.png',
  },
  {
    icon: TreePine,
    title: 'Weekend Agro-Tourism Destination',
    desc: 'A calm, forest-like space where families walk the land, meet the animals, and enjoy a meal together.',
    image: '/images/weekend agro-tourism.png',
  },
];

export default function HomePage() {
  return (
    <div className="bg-background">

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero-farmland.png"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>

        {/* dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10" />

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center py-24">
          <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-5 border border-white/20">
            Coimbatore, Tamil Nadu
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-5">
            Own a Piece of
            <br />
            <span className="text-[#95d5b2]">a Working Farm</span>
          </h1>

          <p className="text-white/85 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-8">
            Real returns from real agriculture — farm produce, livestock, hospitality, and agro-tourism, all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#2d6a4f] font-semibold py-3.5 px-7 rounded-2xl shadow-lg hover:shadow-xl transition-shadow active:scale-[0.97]"
            >
              Start Investing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* quick stats strip */}
          <div className="mt-12 inline-flex items-center gap-5 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/15 text-sm">
            <div className="text-center">
              <span className="block font-bold text-white">₹10k</span>
              <span className="text-white/60">per lot</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="text-center">
              <span className="block font-bold text-white">1%</span>
              <span className="text-white/60">daily / weekday</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="text-center">
              <span className="block font-bold text-white">249</span>
              <span className="text-white/60">weekday payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ LIVE CALCULATOR (embedded) ════════════════════ */}
      <HomeCalculatorSection />

      {/* ════════════════════ REVENUE STREAMS ════════════════════ */}
      <section id="the-farm" className="scroll-mt-20 py-20 sm:py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-xs font-semibold mb-3 tracking-wide uppercase">
              Our Farm Ecosystem
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a] mb-3">
              Seven Revenue Streams Under One Roof
            </h2>
            <p className="text-[#52796f] text-base sm:text-lg max-w-2xl mx-auto">
              Every element supports the others — creating stable, diversified income for our investors and visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {revenueStreams.map((item, i) => (
              <div
                key={i}
                className={`group bg-white rounded-2xl border border-[#d8f3dc] overflow-hidden hover:shadow-lg transition-shadow ${
                  i === revenueStreams.length - 1 && revenueStreams.length % 3 === 1 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <h3 className="font-semibold text-[#1a2e1a]">{item.title}</h3>
                  </div>
                  <p className="text-[#52796f] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ KEY INVESTMENT FACTS ════════════════════ */}
      <section className="py-20 sm:py-24 px-4 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            Investment Opportunity
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Simple. Transparent. Asset-Backed.
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-12">
            Not a financial instrument — a genuine stake in a real farm. Your capital goes into land, crops, livestock, and infrastructure you can visit.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">₹10,000 per Lot</h3>
              <p className="text-white/70 text-sm">Buy 1 or more. No upper limit.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                <Sunrise className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">1% Daily Return</h3>
              <p className="text-white/70 text-sm">₹100/day per lot on weekdays (Mon–Fri)</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">249 Weekdays</h3>
              <p className="text-white/70 text-sm">~1 year cycle · Daily payouts on weekdays (Mon–Fri)</p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow active:scale-[0.97]"
            >
              Start Investing Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════ VISIT SECTION ════════════════════ */}
      <section id="visit" className="scroll-mt-20 py-20 sm:py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-xs font-semibold mb-3 tracking-wide uppercase">
                Plan Your Visit
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a] mb-4">
                See Your Investment in Person
              </h2>
              <p className="text-[#52796f] text-base sm:text-lg leading-relaxed mb-7">
                Walk the land, see the crops, meet the animals, and enjoy a traditional meal at our hut restaurant. 
                The best way to understand what your money supports.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: MapPin, label: 'Coimbatore, Tamil Nadu' },
                  { icon: Sunrise, label: 'Weekends 9 AM – 6 PM', sub: 'Weekdays by appointment' },
                  { icon: Coffee, label: 'Farm walk · Animal feeding · Traditional lunch', sub: 'All included in your visit' },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <row.icon className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a2e1a] text-sm">{row.label}</p>
                      {row.sub && <p className="text-[#52796f] text-xs mt-0.5">{row.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/expansion-bg.jpg"
                alt="Farm landscape"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="font-display text-lg font-bold">Your Weekend Getaway Awaits</p>
                <p className="text-white/70 text-sm mt-1">Fresh air, fresh food, fresh perspective</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ════════════════════ */}
      <section className="py-20 px-4 bg-[#f0f7f0]">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-10 h-10 text-[#2d6a4f] mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a] mb-4">
            Ready to Own a Piece of the Farm?
          </h2>
          <p className="text-[#52796f] text-base sm:text-lg max-w-xl mx-auto mb-8">
            Join hundreds of investors who earn daily returns from real farm revenue. Start with just one lot — ₹10,000.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.97]"
            >
              Start Investing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#52796f] font-semibold py-3.5 px-8 rounded-2xl border border-[#d8f3dc] hover:bg-[#f0f7f0] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}