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