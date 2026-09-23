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
export const PAYOUT_TIMEZONE = 'Asia/Kolkata';

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

let zonedFormatter: Intl.DateTimeFormat | null = null;

function formatter(): Intl.DateTimeFormat {
  if (!zonedFormatter) {
    zonedFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: PAYOUT_TIMEZONE,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
  }
  return zonedFormatter;
}

function getZonedParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
} {
  const map: Record<string, string> = {};
  for (const part of formatter().formatToParts(date)) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: WEEKDAY_INDEX[map.weekday] ?? 0,
  };
}

function zonedTimeToUTC(year: number, month: number, day: number, hour: number, minute: number, second: number): number {
  const naive = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  let guess = naive;
  for (let i = 0; i < 2; i++) {
    const p = getZonedParts(new Date(guess));
    const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, 0);
    guess = naive - (actual - guess);
  }
  return guess;
}

function zonedStartOfDay(date: Date): Date {
  const p = getZonedParts(date);
  return new Date(zonedTimeToUTC(p.year, p.month, p.day, 0, 0, 0));
}

function zonedClockTime(date: Date, hour: number): Date {
  const p = getZonedParts(date);
  return new Date(zonedTimeToUTC(p.year, p.month, p.day, hour, 0, 0));
}

function addZonedDays(date: Date, days: number): Date {
  const p = getZonedParts(date);
  const start = new Date(zonedTimeToUTC(p.year, p.month, p.day, 0, 0, 0));
  return zonedStartOfDay(new Date(start.getTime() + days * 86_400_000));
}

function isZonedWeekday(date: Date): boolean {
  const weekday = getZonedParts(date).weekday;
  return weekday !== 0 && weekday !== 6;
}

export { zonedStartOfDay, isZonedWeekday };

/**
 * Returns the payout dates due for a holding as of `now`.
 * The first payout date is the first day whose 6:00 AM IST is at least 24 hours
 * after `startDate`. Every subsequent weekday 6:00 AM IST adds one payout, capped
 * at TOTAL_WEEKDAYS. Weekends never produce payouts.
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