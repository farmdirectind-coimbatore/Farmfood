'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatINR } from '@/lib/utils/currency';
import { APP_CONSTANTS } from '@/lib/constants';

interface ShareCalculatorProps {
  initialShares?: number;
  maxShares?: number;
  onChange?: (calculation: CalculationResult) => void;
  showBonus?: boolean;
  className?: string;
}

export interface CalculationResult {
  shares: number;
  totalInvested: number;
  dailyPayout: number;
  totalWeekdays: number;
  totalProjectedReturn: number;
  bonusShares?: number;
  totalShares?: number;
}

export function ShareCalculator({
  initialShares = 1,
  maxShares = 1000,
  onChange,
  showBonus = false,
  className = '',
}: ShareCalculatorProps) {
  const [shares, setShares] = useState(initialShares);

  const calculation = useMemo((): CalculationResult => {
    const totalInvested = shares * APP_CONSTANTS.SHARE_PRICE;
    const dailyPayout = totalInvested * APP_CONSTANTS.DAILY_RETURN_RATE;
    const totalProjectedReturn = dailyPayout * APP_CONSTANTS.TOTAL_WEEKDAYS;

    const result: CalculationResult = {
      shares,
      totalInvested,
      dailyPayout,
      totalWeekdays: APP_CONSTANTS.TOTAL_WEEKDAYS,
      totalProjectedReturn,
    };

    if (showBonus) {
      result.bonusShares = shares;
      result.totalShares = shares * 2;
    }

    return result;
  }, [shares, showBonus]);

  const handleIncrement = () => {
    if (shares < maxShares) {
      setShares(shares + 1);
    }
  };

  const handleDecrement = () => {
    if (shares > 1) {
      setShares(shares - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= maxShares) {
      setShares(value);
    }
  };

  // Notify parent of changes
  useEffect(() => {
    onChange?.(calculation);
  }, [calculation, onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#d8f3dc]">
        <label className="text-sm text-[#52796f] mb-2 block">Number of Shares</label>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecrement}
            disabled={shares <= 1}
            className="w-12 h-12 rounded-xl bg-[#d8f3dc] flex items-center justify-center text-2xl font-bold text-[#2d6a4f] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease shares"
          >
            -
          </button>
          
          <div className="flex-1 text-center">
            <input
              type="number"
              value={shares}
              onChange={handleInputChange}
              min={1}
              max={maxShares}
              className="w-full text-4xl font-bold text-[#2d6a4f] bg-transparent border-none outline-none text-center"
              aria-label="Number of shares"
            />
            <p className="text-sm text-[#52796f]">Share{shares > 1 ? 's' : ''}</p>
          </div>
          
          <button
            onClick={handleIncrement}
            disabled={shares >= maxShares}
            className="w-12 h-12 rounded-xl bg-[#2d6a4f] flex items-center justify-center text-2xl font-bold text-white active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase shares"
          >
            +
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#d8f3dc] text-center">
          <p className="text-sm text-[#52796f]">Total Investment</p>
          <p className="text-2xl font-bold text-[#2d6a4f]">{formatINR(calculation.totalInvested)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2d6a4f] to-[#1a4d3a] rounded-2xl p-5 text-white shadow-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-[#95d5b2] text-xs mb-1">Total Shares You Get</p>
            <p className="text-2xl font-bold">
              {showBonus && calculation.totalShares ? calculation.totalShares.toLocaleString() : calculation.shares.toLocaleString()}
            </p>
            {showBonus && calculation.bonusShares && (
              <p className="text-[#95d5b2] text-xs mt-1">
                {calculation.shares.toLocaleString()} selected + {calculation.bonusShares.toLocaleString()} bonus
              </p>
            )}
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-[#95d5b2] text-xs mb-1">Daily Earnings</p>
            <p className="text-2xl font-bold">₹{calculation.dailyPayout.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}