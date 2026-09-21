'use client';

import { Leaf, Calendar, ArrowRight, CheckCircle, AlertCircle, Info, Shield, Wallet, TrendingUp, LogIn } from 'lucide-react';
import Link from 'next/link';
import { ShareCalculator } from '@/components/calculator/ShareCalculator';
import { APP_CONSTANTS } from '@/lib/constants';
import { useSupabaseSession } from '@/components/SupabaseSessionProvider';

const steps = [
  { number: '01', title: 'Choose Your Lots', desc: 'Each lot costs ₹10,000. Use the calculator below to see your exact returns.', icon: Leaf },
  { number: '02', title: 'Transfer Funds', desc: 'Send payment to our bank account (shown after you confirm). Upload a screenshot of the transfer.', icon: Wallet },
  { number: '03', title: 'Verification & Activation', desc: 'Our team verifies your payment within 24 hours. Your holding activates and daily payouts begin on the next weekday.', icon: CheckCircle },
  { number: '04', title: 'Daily Payouts', desc: '1% of your investment daily (₹100 per lot) on weekdays only — credited to your wallet automatically.', icon: Calendar },
  { number: '05', title: 'Track & Reinvest', desc: 'Monitor your portfolio in real-time. At cycle end, reinvest or withdraw. Your principal stays safe.', icon: TrendingUp },
];

const faqs = [
  { q: 'Is this a guaranteed return?', a: 'This is a farm revenue-sharing product, not a bank deposit or guaranteed financial instrument. Returns come from actual farm operations and may vary due to weather, market conditions, crop failure, livestock disease, regulatory changes, and other agricultural risks. Past performance does not guarantee future results.' },
  { q: 'Why only weekdays?', a: 'Our farm operations and markets run Monday–Friday. Weekends are for visitor operations and maintenance. 249 weekdays equals approximately one calendar year.' },
  { q: 'Can I withdraw early?', a: 'Yes, you can withdraw accumulated payouts anytime once your wallet reaches ₹100 minimum. Your principal (lot value) remains invested for the full 249-weekday cycle.' },
  { q: 'What happens after 249 weekdays?', a: 'Your holding completes its cycle. You receive your final payout and can choose to reinvest in a new cycle or withdraw.' },
  { q: 'How is my money used?', a: 'Funds go directly into farm operations: crop cultivation, livestock care, restaurant supplies, infrastructure, and expansion. You can visit the farm to see your investment at work.' },
  { q: 'Are there any fees?', a: 'No hidden fees. The lot price includes everything. Bank transfer charges (if any) are borne by the investor.' },
];

export default function HowItWorksClient() {
  const { session } = useSupabaseSession();

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-24 px-4 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
            Investment Mechanism
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            How Your Investment Works
          </h1>
          <p className="text-white/85 text-base sm:text-lg max-w-2xl mx-auto">
            Simple, transparent, and tied to real farm revenue. No complex financial engineering — just agricultural income shared with you.
          </p>
        </div>
      </section>

      {/* Live Calculator */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a2e1a] mb-3">Investment Calculator</h2>
            <p className="text-[#52796f] text-sm sm:text-base">Adjust lots to see your exact projected returns</p>
          </div>
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#d8f3dc]">
            <ShareCalculator showBonus={false} maxShares={1000} />
          </div>

          {/* Sign in CTA */}
          <div className="mt-8 text-center">
            {session ? (
              <Link
                href="/dashboard/buy-lots"
                className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.97]"
              >
                Buy Lots Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="bg-[#f0f7f0] rounded-2xl p-5 border border-[#d8f3dc]">
                <p className="text-[#52796f] text-sm mb-3">Ready to invest? Sign in with your Google account to get started.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-[#1a2e1a] font-semibold py-3 px-6 rounded-2xl border-2 border-[#d8f3dc] hover:border-[#2d6a4f] hover:shadow-md transition-all active:scale-[0.97]"
                >
                  <LogIn className="w-5 h-5" />
                  Sign in with Google
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="py-16 sm:py-20 px-4 bg-[#f0f7f0]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-14">
            <div className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-[#d8f3dc]">
              <p className="text-2xl sm:text-4xl font-display font-bold text-[#2d6a4f]">₹{APP_CONSTANTS.SHARE_PRICE.toLocaleString()}</p>
              <p className="text-[#52796f] text-xs sm:text-sm mt-1">Per Lot</p>
            </div>
            <div className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-[#d8f3dc]">
              <p className="text-2xl sm:text-4xl font-display font-bold text-[#2d6a4f]">₹{Math.round(APP_CONSTANTS.SHARE_PRICE * APP_CONSTANTS.DAILY_RETURN_RATE).toLocaleString()}</p>
              <p className="text-[#52796f] text-xs sm:text-sm mt-1">Daily Payout / Lot</p>
            </div>
            <div className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-[#d8f3dc]">
              <p className="text-2xl sm:text-4xl font-display font-bold text-[#2d6a4f]">{APP_CONSTANTS.TOTAL_WEEKDAYS}</p>
              <p className="text-[#52796f] text-xs sm:text-sm mt-1">Payout Days</p>
            </div>
            <div className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-[#d8f3dc]">
              <p className="text-2xl sm:text-4xl font-display font-bold text-[#2d6a4f]">1%</p>
              <p className="text-[#52796f] text-xs sm:text-sm mt-1">Daily Return / Lot</p>
            </div>
          </div>

          {/* Steps */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a2e1a] text-center mb-10">5 Steps to Start Earning</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 sm:p-6 flex gap-4 sm:gap-6 border border-[#d8f3dc] hover:shadow-lg transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#d8f3dc] flex items-center justify-center">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#2d6a4f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1">
                    <span className="text-lg sm:text-2xl font-bold text-[#2d6a4f]">{step.number}</span>
                    <h3 className="text-base sm:text-xl font-semibold text-[#1a2e1a]">{step.title}</h3>
                  </div>
                  <p className="text-[#52796f] text-sm leading-relaxed">{step.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#95d5b2] self-center flex-shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 sm:py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 mb-14">
            <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
              <h3 className="text-lg font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#2d6a4f]" />
                Asset-Backed
              </h3>
              <p className="text-[#52796f] text-sm leading-relaxed">
                Your lots represent a stake in a real, operating farm with tangible assets — land, crops, livestock, buildings, and equipment. You can visit and see exactly what you own.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#d8f3dc]">
              <h3 className="text-lg font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                <Info className="w-6 h-6 text-[#2d6a4f]" />
                Transparent Revenue
              </h3>
              <p className="text-[#52796f] text-sm leading-relaxed">
                Returns come from: direct farm produce sales, partner farmer commissions, livestock sales, restaurant revenue, agro-tourism visits, and wholesale distribution — all verifiable.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a2e1a] text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-2xl border border-[#d8f3dc] group">
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer list-none">
                  <h3 className="text-sm sm:text-lg font-semibold text-[#1a2e1a] pr-4">{faq.q}</h3>
                  <AlertCircle className="w-5 h-5 text-[#95d5b2] transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[#52796f] text-sm leading-relaxed border-t border-[#d8f3dc]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Risk */}
      <section className="py-16 sm:py-20 px-4 bg-[#fff8f0]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#fecaca]">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#dc2626]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1a2e1a] mb-2">Important Risk Disclosure</h3>
                <p className="text-[#52796f] text-sm leading-relaxed mb-4">
                  FarmDirect is a farm revenue-sharing product. Returns come from actual farm operations and are not guaranteed.
                  Farm income can vary due to weather, market prices, and other agricultural risks. This is not a bank deposit or regulated financial product.
                </p>
                <Link href="/risk-disclosure" className="inline-flex items-center gap-2 text-[#dc2626] font-semibold text-sm hover:underline">
                  Read Full Risk Disclosure
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 px-4 bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to Invest?</h2>
          <p className="text-white/80 text-base sm:text-lg mb-8">
            Join FarmDirect and earn daily returns from real agricultural revenue.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
          >
            Start Investing Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}