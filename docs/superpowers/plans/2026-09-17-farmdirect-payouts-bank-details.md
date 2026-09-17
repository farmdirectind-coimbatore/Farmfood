# FarmDirect Payouts & Bank Details — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make customer "received" amounts reflect only admin-confirmed payouts, gate payouts behind a 24h + 6am rule, rename "Share"→"Lot" on public pages + calculator, collect per-user bank details, and surface bank details + a UPI/GPay shortcut in the admin tools.

**Architecture:** Next.js App Router + Supabase (admin client reads/writes Postgres). No test framework exists; verification is `npm run build` + `npm run lint` plus manual API inspection via Supabase SQL.

**Tech Stack:** Next.js 16, TypeScript, @supabase/supabase-js, @tanstack/react-query, date-fns.

## Global Constraints

- DB columns `shares` and all internal identifiers stay `shares`. Only displayed copy changes.
- Customer dashboard + admin UI keep "Share" wording EXCEPT the admin payout console (adds bank details) — by user choice.
- Payouts are weekday-only, ≤ 249 per holding. First payout = first 6:00 AM ≥ (start_date + 24h). Every payout appears only at/after the 6 AM of its day. No weekend payouts.
- All payout rows store `payout_date` at local midnight.
- Correctness: recompute totals from the holding's confirmed counters when marking paid.

---

## Task 1: DB columns for user bank details

**Files:**
- Migration via Supabase (apply_migration `add_user_bank_details`)
- Modify: `prisma/schema.prisma` (Profile model)

- [x] Add columns to `profiles`:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_holder_name text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS ifsc_code text,
  ADD COLUMN IF NOT EXISTS upi_id text;
```
- [x] Mirror in `prisma/schema.prisma` Profile model.

## Task 2: Eligibility helper in investment.ts

**Files:**
- Modify: `src/lib/calculations/investment.ts`

- [x] Add `PAYOUT_BATCH_HOUR = 6` constant and:
```ts
export function eligibleWeekdayBatchDates(startDate: Date, now: Date = new Date()): Date[] {
  const eligibleAfter = new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000);
  const cursor = new Date(eligibleAfter.getFullYear(), eligibleAfter.getMonth(), eligibleAfter.getDate());
  cursor.setHours(0, 0, 0, 0);
  while (new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), PAYOUT_BATCH_HOUR, 0, 0, 0).getTime() < eligibleAfter.getTime()) {
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
```

## Task 3: Admin payout console — eligibility generation + bank details

**Files:**
- Modify: `src/app/api/admin/payouts/today/route.ts`
- Modify: `src/app/admin/payouts/page.tsx`

- [x] Rework route to:
  - fetch active holdings with `user:users!holdings_user_id_fkey(id, name, email, profiles:profiles!profiles_user_id_fkey(phone, account_holder_name, account_number, ifsc_code, upi_id))`
  - fetch all payout rows for those holdings; index by holding_id + payout_date key
  - for each holding, `eligibleWeekdayBatchDates(start, now)`; create missing rows (midnight date, `weekdays_paid` = 1-based index, `running_total` = holding.total_paid + daily_payout * offset) via upsert/insert
  - `pending` = unmarked rows, `paid` = rows marked today, `nearingCompletion` (1..10 confirmed days left), `completed`
- [x] Page: add `refetchInterval` (~60s), row detail block with bank info, GPay deep-link button when UPI exists, and "New payouts appear at 6 AM · first payout 24h after approval" note.

## Task 4: Mark-paid correct math

**Files:**
- Modify: `src/app/api/admin/payouts/mark-paid/route.ts`
- Modify: `src/app/api/admin/payouts/mark-all-paid/route.ts`

- [x] Recompute from holding: `newTotalPaid = Number(payout.holding.total_paid) + Number(payout.amount)`, `newWeekdaysPaid = (payout.holding.weekdays_paid || 0) + 1`. Keep notifications/audit/email.

## Task 5: Customer confirmed-only amounts

**Files:**
- Modify: `src/app/api/dashboard/stats/route.ts`
- Modify: `src/app/api/dashboard/holdings/route.ts`
- Modify: `src/app/api/dashboard/payouts/route.ts`

- [x] stats: sum confirmed payouts for `totalReceived`; per-holding uses confirmed `weekdays_paid`/`total_paid`; `projectedRemaining` = projected − received.
- [x] holdings: `progress` from confirmed counters.
- [x] payouts: filter `.not('marked_by', 'is', null)`.

## Task 6: Onboarding + profile bank details

**Files:**
- Modify: `src/app/welcome/page.tsx`
- Modify: `src/app/api/dashboard/profile/route.ts`
- Modify: `src/app/dashboard/profile/page.tsx`

- [x] PATCH/GET accept/return bank fields (preserve address/pan on PATCH).
- [x] Welcome page: bank details section with validation (holder name required; A/C 9-18 digits; IFSC `^[A-Z]{4}0[A-Z0-9]{6}$`; UPI optional).
- [x] Profile page: editable bank fields.

## Task 7: Admin users bank details

**Files:**
- Modify: `src/app/api/admin/users/route.ts`
- Modify: `src/app/admin/users/page.tsx`

- [x] Route: join `profiles` and return `profile` object per user.
- [x] Page: expandable row with phone + bank details.

## Task 8: Share → Lot (public pages) + calculator

**Files:**
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/(public)/how-it-works/page.tsx`, `HowItWorksClient.tsx`
- Modify: `src/app/(public)/terms/page.tsx`, `privacy/page.tsx`, `risk-disclosure/page.tsx`
- Modify: `src/app/(public)/HomeCalculatorSection.tsx`
- Modify: `src/components/calculator/ShareCalculator.tsx`
- Modify: `src/components/forms/PurchaseForm.tsx`

- [x] ShareCalculator: add `unit?: 'lot' | 'share'` prop (default `'lot'`); labels conditional; add Total Return after 249 days + Net Profit cards.
- [x] PurchaseForm: pass `unit="share"`.
- [x] Public copy: replace "share"/"Shares" marketing mentions with "lot"/"Lots".

## Task 9: Verify

- [x] `npm run build`
- [x] `npm run lint`
- [x] Sanity-check DB columns exist.