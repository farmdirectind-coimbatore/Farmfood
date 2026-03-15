export const metadata = {
  title: "FarmDirect Daily Fresh Vegetables",
  description: "Fresh vegetables directly from farmers to your home in Coimbatore.",
  openGraph: {
    title: "FarmDirect Daily Fresh Vegetables",
    description: "Fresh vegetables directly from farmers to your home.",
    url: "https://farmdirect.co.in",
    siteName: "FarmDirect",
    images: [
      {
        url: "/processing.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf, Truck, Store, Smartphone, Tablet, Users, Recycle, 
  MapPin, TrendingUp, Shield, Clock, Phone, Mail, 
  ChevronRight, ChevronDown, ArrowRight, Check, 
  Calculator, PiggyBank, Target, Award, X, Menu, Wallet
} from 'lucide-react'

// Page types
type Page = 'home' | 'investor'

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [showContact, setShowContact] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parallax scroll effect
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => setScrollY(container.scrollTop)
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top when page changes
  const handleNavigate = (page: Page) => {
    const container = containerRef.current
    if (container) {
      // Force immediate scroll to top
      container.scrollTo(0, 0)
    }
    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
      setCurrentPage(page)
    })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Desktop Only - Mobile/Tablet Required Message */}
      <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-gradient-to-br from-[#1a2e1a] to-[#2d6a4f]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-10 max-w-md"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-6"
          >
            <Smartphone className="w-24 h-24 text-[#95d5b2] mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">Best Viewed on Mobile</h1>
          <p className="text-[#95d5b2] text-lg mb-6">
            For the best experience, please visit this website on your mobile phone or tablet.
          </p>
          <div className="flex items-center justify-center gap-4 text-[#74c69d]">
            <Smartphone className="w-6 h-6" />
            <span className="text-lg">Mobile</span>
            <span className="text-[#40916c]">|</span>
            <Tablet className="w-6 h-6" />
            <span className="text-lg">Tablet</span>
          </div>
          <div className="mt-8 pt-6 border-t border-[#40916c]">
            <img 
              src="/images/logo.png" 
              alt="FarmDirect Logo" 
              className="h-16 w-auto mx-auto opacity-80"
            />
          </div>
        </motion.div>
      </div>

      {/* Mobile Content */}
      <div ref={containerRef} className="min-h-screen overflow-y-auto overflow-x-hidden hide-scrollbar lg:hidden">
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <HomePage 
              key="home" 
              onNavigate={() => handleNavigate('investor')}
              scrollY={scrollY}
            />
          ) : (
            <InvestorPage 
              key="investor" 
              onBack={() => handleNavigate('home')}
              onContact={() => setShowContact(true)}
              scrollY={scrollY}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  )
}

// ==================== HOME PAGE ====================
function HomePage({ onNavigate, scrollY }: { onNavigate: () => void; scrollY: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Hero Section with Parallax */}
      <section className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-6 pt-2">
          {/* Logo Header - Full Black Bar */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center -mx-6 -mt-2 mb-4"
          >
            <div className="bg-black/70 w-full py-4 flex justify-center">
              <img 
                src="/images/logo.png" 
                alt="FarmDirect Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Hero Text */}
          <div className="flex-1 flex flex-col justify-end pb-32">
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-white font-bold text-xs mb-4 text-center tracking-widest uppercase"
            >
              Coimbatore's Agri-Tech Revolution
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white text-4xl font-bold leading-tight mb-6 text-center"
            >
              Farm Fresh, <span className="text-white">Straight to Your Door</span>
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-black/50 backdrop-blur-md rounded-2xl p-5 mx-auto max-w-sm"
            >
              <p className="text-white text-lg leading-relaxed text-center">
                Bridging farmers and consumers with zero middlemen. Peak freshness, fair pricing, and sustainable practices.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
        >
          <span className="text-white/60 text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </section>

      {/* Core Business Model */}
      <section className="py-16 px-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-[#40916c] font-semibold text-sm uppercase tracking-wider">Core Business</span>
          <h3 className="text-2xl font-bold text-[#1a2e1a] mt-2 mb-4">Three Specialized Channels</h3>
          <p className="text-[#52796f] leading-relaxed">
            Direct sourcing eliminates middlemen to provide maximum value to both producers and consumers.
          </p>
        </motion.div>

        <div className="space-y-4">
          {[
            { icon: Store, title: 'Vegetable Hub (Wholesale)', desc: 'B2B bulk delivery to local vegetable shops, hotels, catering services, and hostels.', img: '/images/wholesale-hub.png' },
            { icon: Truck, title: 'Retail Stores', desc: 'Modern physical outlets where customers can hand-pick farm-fresh produce daily.', img: '/images/retail-store-new.png' },
            { icon: Smartphone, title: 'WhatsApp Order System', desc: 'Simplified digital ordering with rapid doorstep delivery for tech-savvy households.', img: '/images/whatsapp-order.png' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50, rotateY: -10 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-[#d8f3dc]"
            >
              <div className="h-36 overflow-hidden">
                <motion.img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 rounded-xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0"
                  >
                    <item.icon className="w-5 h-5 text-[#2d6a4f]" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#1a2e1a] mb-1">{item.title}</h4>
                    <p className="text-sm text-[#52796f]">{item.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expansion Strategy */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/expansion.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-sm font-medium mb-4">
              Expansion Strategy
            </span>
            <h3 className="text-2xl font-bold text-white mb-3">From Coimbatore to Tamil Nadu</h3>
            <p className="text-white/90 max-w-sm mx-auto">
              Launching 10 flagship outlets across major town centers, with phased expansion to every district.
            </p>
          </motion.div>

          <div className="flex justify-center gap-8">
            <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -10 }}
              className="text-center"
            >
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-[#2d6a4f] flex items-center justify-center mb-3 mx-auto shadow-lg"
              >
                <Store className="w-10 h-10 text-white" />
              </motion.div>
              <p className="text-3xl font-bold text-white">10+</p>
              <p className="text-sm text-white/80">Flagship Stores</p>
            </motion.div>
            <motion.div 
              initial={{ scale: 0, rotate: 20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, y: -10 }}
              className="text-center"
            >
              <motion.div 
                whileHover={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-[#40916c] flex items-center justify-center mb-3 mx-auto shadow-lg"
              >
                <MapPin className="w-10 h-10 text-white" />
              </motion.div>
              <p className="text-3xl font-bold text-white">38</p>
              <p className="text-sm text-white/80">Districts Target</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-[#95d5b2] font-semibold text-sm uppercase tracking-wider"
          >
            Impact
          </motion.span>
          <motion.h3 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-white mt-2 mb-4"
          >
            Creating Value for Everyone
          </motion.h3>
        </motion.div>

        <div className="space-y-4">
          {[
            { title: 'For Customers', desc: 'Guaranteed daily fresh produce at lower prices due to shortened supply chain.', icon: Users, color: '#95d5b2' },
            { title: 'For Farmers', desc: 'Stable, direct-to-market access ensuring fair profits without middlemen exploitation.', icon: TrendingUp, color: '#74c69d' },
            { title: 'For Community', desc: 'Significant job creation for local youth in logistics, retail, and food processing.', icon: Award, color: '#52b788' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50, rotateX: -10 }}
              whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.03, x: 10 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20"
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"
                >
                  <item.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Zero Waste Innovation */}
      <section className="py-16 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[#40916c] font-semibold text-sm uppercase tracking-wider">Innovation</span>
          <h3 className="text-2xl font-bold text-[#1a2e1a] mt-2 mb-4">Zero-Waste Strategy</h3>
          <p className="text-[#52796f] mb-8 leading-relaxed">
            Converting potential waste into high-margin shelf-stable products through our Value-Added Processing Unit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden shadow-xl mb-8"
        >
          <img 
            src="/images/veg-powders.png" 
            alt="Vegetable Powders"
            className="w-full h-48 object-cover"
          />
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#d8f3dc] rounded-2xl p-5 text-center"
          >
            <Recycle className="w-8 h-8 text-[#2d6a4f] mx-auto mb-2" />
            <h4 className="font-semibold text-[#1a2e1a] mb-1">Vegetable Powders</h4>
            <p className="text-xs text-[#52796f]">Cooking & health supplements</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#d8f3dc] rounded-2xl p-5 text-center"
          >
            <Leaf className="w-8 h-8 text-[#2d6a4f] mx-auto mb-2" />
            <h4 className="font-semibold text-[#1a2e1a] mb-1">Dehydrated Snacks</h4>
            <p className="text-xs text-[#52796f]">Healthy snacking options</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#2d6a4f] to-[#52b788] rounded-3xl p-8 text-center shadow-xl"
        >
          <Leaf className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-3">Our Commitment</h3>
          <p className="text-white/90 text-sm leading-relaxed mb-6">
            FarmDirect is more than a store — it's a sustainable ecosystem built on trust, efficiency, 
            and the promise of a healthier lifestyle for our customers and a better future for our farmers.
          </p>
          <button
            onClick={onNavigate}
            className="bg-white text-[#2d6a4f] font-semibold py-4 px-8 rounded-2xl inline-flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <span>View Investment Opportunity</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2e1a] py-8 px-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/images/logo.png" 
            alt="FarmDirect Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="text-[#95d5b2] text-xs text-center">
          © 2026 FarmDirect Daily Fresh Vegetables<br />
          Coimbatore, Tamil Nadu
        </p>
      </footer>
    </motion.div>
  )
}

// ==================== INVESTOR PAGE ====================
function InvestorPage({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  const [shares, setShares] = useState(1)
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll to top on mount
  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })
    }
  }, [])

  // Calculator values based on shares
  // 1 share = ₹5/day, with Buy 1 Get 1 bonus = 2 shares = ₹10/day
  const investment = shares * 10000
  const bonusShares = shares // Buy 1 Get 1 for first 5000 shares
  const totalShares = shares + bonusShares

  const dailyEarningPerShare = 5
  const dailyFromPurchased = shares * dailyEarningPerShare
  const dailyFromBonus = bonusShares * dailyEarningPerShare
  const dailyReturn = dailyFromPurchased + dailyFromBonus

  const monthlyFromPurchased = dailyFromPurchased * 30
  const monthlyFromBonus = dailyFromBonus * 30
  const monthlyReturn = monthlyFromPurchased + monthlyFromBonus

  const annualFromPurchased = monthlyFromPurchased * 12
  const annualFromBonus = monthlyFromBonus * 12
  const totalProfitFromPurchased = annualFromPurchased * 5
  const totalProfitFromBonus = annualFromBonus * 5
  const totalProfit = totalProfitFromPurchased + totalProfitFromBonus

  const bonusValue = bonusShares * 10000
  const totalCapital = totalShares * 10000
  const totalValue = totalCapital + totalProfit

  return (
    <motion.div
      ref={pageRef}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black">
        <div className="flex items-center justify-between p-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <img 
            src="/images/logo.png" 
            alt="FarmDirect Logo" 
            className="h-20 w-auto object-contain"
          />
          <div className="w-10" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-80 overflow-hidden">
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/investment.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative h-full flex flex-col justify-end p-6">
          <span className="inline-block px-3 py-1 bg-[#95d5b2] text-[#1a2e1a] rounded-full text-xs font-semibold mb-3 w-fit">
            Limited Time Offer
          </span>
          <h2 className="text-white text-3xl font-bold leading-tight mb-2">
            Securing the Future<br />of Farming
          </h2>
          <p className="text-white font-semibold text-sm">
            Guaranteed Returns with Equity-Plus-Fixed-Return Model
          </p>
        </div>
      </section>

      {/* Offering Structure */}
      <section className="py-12 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-6">Offering Structure</h3>
          
          <div className="bg-gradient-to-br from-[#2d6a4f] to-[#40916c] rounded-3xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#95d5b2] text-sm">Total Shares</p>
                <p className="text-white text-2xl font-bold">10,000</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#95d5b2] text-sm">Face Value</p>
                <p className="text-white text-2xl font-bold">₹10,000</p>
              </div>
              <div>
                <p className="text-[#95d5b2] text-sm">Target</p>
                <p className="text-white text-2xl font-bold">₹5 Cr</p>
              </div>
            </div>
          </div>

          {/* Special Offer */}
          <div className="bg-[#fef3c7] border-2 border-[#f59e0b] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#f59e0b] text-white text-xs font-bold rounded">SPECIAL</span>
              <span className="font-semibold text-[#92400e]">Introductory Offer</span>
            </div>
            <p className="text-[#92400e] text-lg font-bold mb-1">Buy 1, Get 1 Free</p>
            <p className="text-[#b45309] text-sm">First 5,000 shares only — Buy 1 share, get 2 shares</p>
          </div>
        </motion.div>
      </section>

      {/* ROI Calculator */}
      <section className="py-12 px-6 bg-[#f0f7f0]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a2e1a]">Investment Calculator</h3>
              <p className="text-[#52796f] text-sm">Calculate your returns</p>
            </div>
          </div>

          {/* Shares Input */}
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-[#d8f3dc]">
            <label className="text-sm text-[#52796f] mb-2 block">Number of Shares</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShares(Math.max(1, shares - 1))}
                className="w-12 h-12 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-2xl font-bold text-[#2d6a4f] active:scale-95 transition-transform"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <p className="text-4xl font-bold text-[#2d6a4f]">{shares}</p>
                <p className="text-sm text-[#52796f]">Share{shares > 1 ? 's' : ''}</p>
              </div>
              <button 
                onClick={() => setShares(Math.min(50, shares + 1))}
                className="w-12 h-12 rounded-xl bg-[#2d6a4f] flex items-center justify-center text-2xl font-bold text-white active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-[#d8f3dc] text-center">
              <p className="text-sm text-[#52796f]">Total Investment</p>
              <p className="text-2xl font-bold text-[#2d6a4f]">₹{investment.toLocaleString()}</p>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a] rounded-2xl p-5 text-white shadow-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-[#95d5b2] text-xs mb-1">Total Shares You Get</p>
                <p className="text-2xl font-bold">{totalShares.toLocaleString()}</p>
                <p className="text-[#95d5b2] text-xs mt-1">
                  {shares.toLocaleString()} selected + {bonusShares.toLocaleString()} bonus
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-[#95d5b2] text-xs mb-1">Daily Earnings</p>
                <p className="text-2xl font-bold">₹{dailyReturn.toLocaleString()}</p>
                <p className="text-[#95d5b2] text-xs mt-1">
                  ₹{dailyFromPurchased.toLocaleString()} from selected + ₹{dailyFromBonus.toLocaleString()} from bonus
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-[#95d5b2] text-xs mb-1">Monthly Return</p>
                <p className="text-xl font-bold">₹{monthlyReturn.toLocaleString()}</p>
                <p className="text-[#95d5b2] text-xs mt-1">
                  ₹{monthlyFromPurchased.toLocaleString()} from selected + ₹{monthlyFromBonus.toLocaleString()} from bonus
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-[#95d5b2] text-xs mb-1">5-Year Profit</p>
                <p className="text-xl font-bold">₹{totalProfit.toLocaleString()}</p>
                <p className="text-[#95d5b2] text-xs mt-1">
                  ₹{totalProfitFromPurchased.toLocaleString()} from selected + ₹{totalProfitFromBonus.toLocaleString()} from bonus
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#95d5b2] text-xs">Total Value After 5 Years</p>
                  <p className="text-3xl font-bold">₹{totalValue.toLocaleString()}</p>
                  <p className="text-[#95d5b2] text-xs mt-1">
                    (₹{totalCapital.toLocaleString()} share value + ₹{totalProfit.toLocaleString()} profit)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#95d5b2] text-xs">Invested: ₹{investment.toLocaleString()}</p>
                  <p className="text-[#95d5b2] text-xs">Bonus value: ₹{bonusValue.toLocaleString()}</p>
                  <p className="text-[#95d5b2] text-xs mt-1">5-year profit: ₹{totalProfit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Wallet Info */}
      <section className="py-8 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#2d6a4f] to-[#40916c] rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">Daily Wallet Credits</h4>
              <p className="text-white/90 text-sm leading-relaxed">
                Your profits are credited to your wallet every day. Withdraw anytime when your balance reaches a minimum of ₹100.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why This Model Works */}
      <section className="py-12 px-6 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h3 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white mb-6"
          >
            Why This Model Works
          </motion.h3>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, title: 'High Cash Flow', desc: 'Daily income credited to your wallet' },
              { icon: Shield, title: 'Asset-Backed', desc: 'Backed by physical retail outlets and processing units' },
              { icon: Recycle, title: 'Risk Mitigation', desc: 'Zero-waste strategy ensures consistent profitability' }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 active:scale-98"
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-white/80 text-sm">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Utilization of Funds */}
      <section className="py-12 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-6">Utilization of Funds</h3>

          <div className="space-y-3">
            {[
              { title: 'Direct Farm Sourcing Centers', desc: 'Collection points in rural Tamil Nadu', percent: 25 },
              { title: '10-Outlet Launch', desc: 'Flagship stores in Coimbatore', percent: 30 },
              { title: 'Logistics Fleet', desc: 'Temperature-controlled delivery vans', percent: 20 },
              { title: 'Processing Unit', desc: 'Industrial dehydrators and grinders', percent: 25 }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-[#d8f3dc]"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-[#1a2e1a]">{item.title}</p>
                  <motion.span 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    className="text-[#2d6a4f] font-bold"
                  >
                    {item.percent}%
                  </motion.span>
                </div>
                <p className="text-sm text-[#52796f] mb-2">{item.desc}</p>
                <div className="h-2 bg-[#f0f7f0] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#2d6a4f] to-[#52b788] rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Processing Unit Image */}
      <section className="py-12 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden shadow-xl"
        >
          <img 
            src="/images/processing.png" 
            alt="Processing Unit"
            className="w-full h-48 object-cover"
          />
          <div className="bg-[#2d6a4f] p-5">
            <h4 className="text-white font-semibold mb-1">Value-Added Processing Unit</h4>
            <p className="text-[#95d5b2] text-sm">Converting surplus into high-margin shelf-stable products</p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#f0f7f0]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#2d6a4f] flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <PiggyBank className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-3">Ready to Invest?</h3>
          <p className="text-[#52796f] text-sm mb-6 max-w-sm mx-auto">
            The "Buy 1 Get 1" offer is limited to the first 5,000 shares. 
            Secure your investment today.
          </p>
          <button
            onClick={onContact}
            className="bg-[#2d6a4f] text-white font-semibold py-4 px-8 rounded-2xl inline-flex items-center gap-2 shadow-lg active:scale-95 transition-transform w-full justify-center"
          >
            <Phone className="w-5 h-5" />
            <span>Contact Us to Invest</span>
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2e1a] py-8 px-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/images/logo.png" 
            alt="FarmDirect Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="text-[#95d5b2] text-xs text-center mb-4">
          Invest in a Greener, Waste-Free Future
        </p>
      </footer>
    </motion.div>
  )
}

// ==================== CONTACT MODAL ====================
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
        
        <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">Contact Us</h3>
        <p className="text-[#52796f] text-sm mb-6">
          Get in touch with us to discuss investment opportunities.
        </p>

        <div className="space-y-4">
          <a 
            href="tel:+919840830369"
            className="flex items-center gap-4 p-4 bg-[#d8f3dc] rounded-2xl active:bg-[#b7e4c7] transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#2d6a4f] flex items-center justify-center">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1a2e1a]">Call Us</p>
              <p className="text-[#52796f] text-sm">+91 98408 30369</p>
            </div>
          </a>

          <a 
            href="mailto:farmdirect.ind@gmail.com"
            className="flex items-center gap-4 p-4 bg-[#d8f3dc] rounded-2xl active:bg-[#b7e4c7] transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#40916c] flex items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1a2e1a]">Email Us</p>
              <p className="text-[#52796f] text-sm">farmdirect.ind@gmail.com</p>
            </div>
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full border border-[#d8f3dc] text-[#52796f] font-medium py-3 rounded-xl active:bg-[#f0f7f0] transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
