// The FarmDirect business runs on India Standard Time, but the hosting
// platforms (Vercel, Supabase Edge) run their Node runtimes in UTC. Every
// payout-schedule "local time" boundary — the 6:00 AM batch, calendar-day
// start, and weekday checks — must therefore be computed explicitly in IST.

export const PAYOUT_TIMEZONE = 'Asia/Kolkata';

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
}

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

/**
 * The Asia/Kolkata wall-clock fields for the given instant.
 */
export function getZonedParts(date: Date): ZonedParts {
  const map: Record<string, string> = {};
  for (const part of formatter().formatToParts(date)) {
    if (part.type !== 'literal') {
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

/**
 * The UTC timestamp whose Asia/Kolkata wall-clock reads the given local
 * date/time. Two-pass offset correction handles the fixed +05:30 offset (and
 * would tolerate DST for other zones if the offset ever changed).
 */
export function zonedTimeToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): number {
  const naive = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  let guess = naive;
  for (let i = 0; i < 2; i++) {
    const p = getZonedParts(new Date(guess));
    const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, 0);
    guess = naive - (actual - guess);
  }
  return guess;
}

/**
 * The instant of 00:00 on the Asia/Kolkata calendar day containing `date`.
 */
export function zonedStartOfDay(date: Date): Date {
  const p = getZonedParts(date);
  return new Date(zonedTimeToUTC(p.year, p.month, p.day, 0, 0, 0));
}

/**
 * The instant of the given wall-clock time on the Asia/Kolkata calendar day
 * containing `date`.
 */
export function zonedClockTime(date: Date, hour: number, minute = 0, second = 0): Date {
  const p = getZonedParts(date);
  return new Date(zonedTimeToUTC(p.year, p.month, p.day, hour, minute, second));
}

/**
 * The Asia/Kolkata midnight `days` calendar days after `date`.
 */
export function addZonedDays(date: Date, days: number): Date {
  const p = getZonedParts(date);
  const start = new Date(zonedTimeToUTC(p.year, p.month, p.day, 0, 0, 0));
  return zonedStartOfDay(new Date(start.getTime() + days * 86_400_000));
}

/**
 * True when the Asia/Kolkata calendar day containing `date` is Mon–Fri.
 */
export function isZonedWeekday(date: Date): boolean {
  const weekday = getZonedParts(date).weekday;
  return weekday !== 0 && weekday !== 6;
}

/**
 * Stable "YYYY-MM-DD" key for the Asia/Kolkata calendar day of `date`.
 */
export function zonedDayKey(date: Date): string {
  const p = getZonedParts(date);
  const month = String(p.month).padStart(2, '0');
  const day = String(p.day).padStart(2, '0');
  return `${p.year}-${month}-${day}`;
}

export function isSameZonedDay(a: Date, b: Date): boolean {
  return zonedDayKey(a) === zonedDayKey(b);
}

export function zonedStartOfMonth(date: Date): Date {
  const p = getZonedParts(date);
  return new Date(zonedTimeToUTC(p.year, p.month, 1, 0, 0, 0));
}

export function zonedStartOfYear(date: Date): Date {
  const p = getZonedParts(date);
  return new Date(zonedTimeToUTC(p.year, 1, 1, 0, 0, 0));
}