'use client';

import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';
import { ShareCalculator } from '@/components/calculator/ShareCalculator';
import { useSupabaseSession } from '@/components/SupabaseSessionProvider';

export default function HomeCalculatorSection() {
  const { session } = useSupabaseSession();

  return (
    <section className="py-20 sm:py-24 px-4 bg-[#f0f7f0]">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-xs font-semibold mb-3 tracking-wide uppercase">
            Live Calculator
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a] mb-3">
            See Your Projected Returns
          </h2>
          <p className="text-[#52796f] text-base">
            Adjust the number of lots to see exactly how much you would earn.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#d8f3dc]">
          <ShareCalculator maxShares={1000} />
        </div>

        <div className="text-center mt-8">
          {session ? (
            <Link
              href="/dashboard/buy-lots"
              className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.97]"
            >
              Buy Lots Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#2d6a4f] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:bg-[#1a4d3a] hover:shadow-lg transition-all active:scale-[0.97]"
            >
              <LogIn className="w-5 h-5" />
              Sign in to Start Investing
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}