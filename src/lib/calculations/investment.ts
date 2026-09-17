// Investment constants
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
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

export function calculateEndDate(startDate: Date): Date {
  let current = new Date(startDate);
  let weekdaysCount = 0;

  while (weekdaysCount < INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      weekdaysCount++;
    }
  }

  return current;
}

export function getTodaysPayoutsQuery() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    today,
    tomorrow,
    isWeekday: today.getDay() !== 0 && today.getDay() !== 6,
  };
}

/**
 * Returns the payout dates due for a holding as of `now`.
 * The first payout date is the first day whose 6:00 AM is at least 24 hours
 * after `startDate`. Every subsequent weekday 6:00 AM adds one payout, capped
 * at TOTAL_WEEKDAYS. Weekends never produce payouts.
 */
export function eligibleWeekdayBatchDates(startDate: Date, now: Date = new Date()): Date[] {
  const eligibleAfter = new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000);
  const cursor = new Date(eligibleAfter.getFullYear(), eligibleAfter.getMonth(), eligibleAfter.getDate());
  cursor.setHours(0, 0, 0, 0);

  while (
    new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), PAYOUT_BATCH_HOUR, 0, 0, 0).getTime() <
    eligibleAfter.getTime()
  ) {
    cursor.setDate(cursor.getDate() + 1);
  }

  const dates: Date[] = [];
  while (dates.length < INVESTMENT_CONSTANTS.TOTAL_WEEKDAYS) {
    const batch = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), PAYOUT_BATCH_HOUR, 0, 0, 0);
    if (batch.getTime() > now.getTime()) break;
    if (batch.getDay() !== 0 && batch.getDay() !== 6) {
      dates.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}