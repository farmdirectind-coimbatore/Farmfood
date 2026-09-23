// Investment constants
import {
  addZonedDays,
  isZonedWeekday,
  zonedClockTime,
  zonedDayKey,
  zonedStartOfDay,
} from '@/lib/utils/time';

export const INVESTMENT_CONSTANTS = {
  SHARE_PRICE: 10000,
  DAILY_RETURN_RATE: 0.01,
  TOTAL_WEEKDAYS: 249,
  MIN_WITHDRAWAL: 100,
  MAX_SHARES_PER_USER: 1000,
  SCREENSHOT_MAX_SIZE: 5 * 1024 * 1024,
} as const;

export const PAYOUT_BATCH_HOUR = 6;

export type InvestmentCalculation = {
  shares: number;
  totalInvested: number;
  dailyPayout: number;
  totalWeekdays: number;
  totalProjectedReturn: number;
};

export function calculateInvestment(shares: number): InvestmentCalculation {
  const totalInvested = shares * INVESTMENT_CONSTANTS.SHARE_PRICE;
  const dailyPayout = totalInvested * INVESTMENT_CONSTANTS.DAILY_RETURN_RATE;
  const totalProjectedReturn = dailyPayout * INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS;

  return {
    shares,
    totalInvested,
    dailyPayout,
    totalWeekdays: INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS,
    totalProjectedReturn,
  };
}

export function calculateHoldingProgress(
  holding: {
    startDate?: Date | string;
    start_date?: Date | string;
    dailyPayout?: number;
    daily_payout?: number;
    totalProjectedReturn?: number;
    total_projected_return?: number;
    weekdaysPaid?: number;
    weekdays_paid?: number;
    totalPaid?: number;
    total_paid?: number;
  },
  today: Date = new Date()
): {
  weekdaysPaid: number;
  amountReceived: number;
  amountRemaining: number;
  daysLeft: number;
  isComplete: boolean;
  progressPercent: number;
} {
  const startDate = new Date(holding.startDate ?? holding.start_date ?? new Date());
  const weekdaysElapsed = countWeekdays(startDate, today);
  const weekdaysPaid = Math.min(weekdaysElapsed, INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS);
  const dailyPayout = Number(holding.dailyPayout ?? holding.daily_payout ?? 0);
  const totalProjectedReturn = Number(holding.totalProjectedReturn ?? holding.total_projected_return ?? 0);
  const amountReceived = dailyPayout * weekdaysPaid;
  const amountRemaining = totalProjectedReturn - amountReceived;
  const daysLeft = INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS - weekdaysPaid;
  const isComplete = weekdaysPaid >= INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS;
  const progressPercent = (weekdaysPaid / INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS) * 100;

  return {
    weekdaysPaid,
    amountReceived,
    amountRemaining,
    daysLeft,
    isComplete,
    progressPercent,
  };
}

function countWeekdays(start: Date, end: Date): number {
  let count = 0;
  const endDay = zonedDayKey(end);
  let current = zonedStartOfDay(start);

  while (zonedDayKey(current) <= endDay) {
    if (isZonedWeekday(current)) {
      count++;
    }
    current = addZonedDays(current, 1);
  }

  return count;
}

export function calculateEndDate(startDate: Date): Date {
  let current = zonedStartOfDay(startDate);
  let weekdaysCount = 0;

  while (weekdaysCount < INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS) {
    current = addZonedDays(current, 1);
    if (isZonedWeekday(current)) {
      weekdaysCount++;
    }
  }

  return current;
}

export function getTodaysPayoutsQuery() {
  const today = zonedStartOfDay(new Date());
  const tomorrow = addZonedDays(today, 1);

  return {
    today,
    tomorrow,
    isWeekday: isZonedWeekday(today),
  };
}

/**
 * Returns the payout dates due for a holding as of `now`.
 * The first payout date is the first day whose 6:00 AM IST is at least 24 hours
 * after `startDate`. Every subsequent weekday 6:00 AM IST adds one payout,
 * capped at TOTAL_WEEKDAYS. Weekends never produce payouts.
 *
 * All boundaries are evaluated in Asia/Kolkata regardless of the host's
 * timezone so the daily batch fires at 6:00 AM India time.
 */
export function eligibleWeekdayBatchDates(startDate: Date, now: Date = new Date()): Date[] {
  const eligibleAfter = new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000);

  let cursor = zonedStartOfDay(eligibleAfter);
  while (zonedClockTime(cursor, PAYOUT_BATCH_HOUR).getTime() < eligibleAfter.getTime()) {
    cursor = addZonedDays(cursor, 1);
  }

  const dates: Date[] = [];
  while (dates.length < INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS) {
    const batch = zonedClockTime(cursor, PAYOUT_BATCH_HOUR).getTime();
    if (batch > now.getTime()) break;
    if (isZonedWeekday(cursor)) {
      dates.push(cursor);
    }
    cursor = addZonedDays(cursor, 1);
  }

  return dates;
}