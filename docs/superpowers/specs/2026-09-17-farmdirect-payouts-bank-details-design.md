# FarmDirect — Payouts flow, Lot naming, and User Bank Details

Date: 2026-09-17

## Goal

Fix the customer/admin payout flow so amounts reflect only admin-confirmed payouts,
gate the first payout behind a 24-hour + 6am rule, rename "Share" to "Lot" on public
pages and the calculator, collect per-user bank details at onboarding, and surface
bank details + a UPI/GPay shortcut in the admin payout console.

## 1. Confirmed-only "Received" amounts

- `GET /api/dashboard/stats`: `totalReceived` and `projectedRemaining` are computed from
  admin-marked payouts (`payouts` where `marked_by IS NOT NULL`), not from elapsed-weekday
  math. Per-holding `weekdays_paid`/`total_paid`/progress come from the holding's confirmed
  counters. New/current holdings show ₹0 until the first payout is marked paid.
- `GET /api/dashboard/holdings` (portfolio): "Received So Far", "Weekdays Paid" and the
  progress bar use confirmed data; "Remaining Returns" = projected − confirmed received.
- `GET /api/dashboard/payouts` (history): list and summary totals include only
  `marked_by` payouts (pending rows are never shown to customers).

## 2. First-payout eligibility: 24 hours + 6am batch

- New helper in `src/lib/calculations/investment.ts`:
  `eligibleWeekdayBatches(startDate, now): number`
  - Earliest batch = first day whose 6:00 AM is >= `start_date + 24h`.
  - Counts every weekday whose 6 AM <= now.
- `GET /api/admin/payouts/today` uses the helper to create/return all eligible pending
  payout rows, including missed days (each its own row, sequential running totals).
  Nothing appears before 24h or before 6am, and weekends never produce payouts.
- Admin console polls via `refetchInterval` (~60s) so new payouts appear automatically.
- Note text: "New payouts appear at 6 AM · first payout 24h after approval."

## 3. Correct mark-paid math

`POST /api/admin/payouts/mark-paid` and `/mark-all-paid` recompute from the holding's
current confirmed values:
`newTotalPaid = holding.total_paid + amount`, `newWeekdaysPaid = holding.weekdays_paid + 1`.
Status becomes COMPLETED when `newWeekdaysPaid >= 249`. This is monotonic and safe even
if days are marked out of order or in bulk after several missed days.

## 4. "Share" → "Lot" on public pages + calculator

- Home page: "per share" → "per lot", "₹10,000 per Share" → "per Lot",
  "₹100/day per share" → "per lot", and the metadata descriptions.
- How-it-works, terms, privacy, risk-disclosure: displayed "Shares" text → "Lots".
- `ShareCalculator`: labels flip to lots; add **Total Investment**, **Daily Earnings**,
  **Total Return after 249 days** (e.g. ₹24,900 per lot), **Net Profit** (₹14,900 per lot).
- Customer dashboard + admin text and DB column names stay `shares`.

## 5. Per-user bank details

- DB: add `account_holder_name`, `account_number`, `ifsc_code`, `upi_id` to `profiles`
  (nullable so existing users aren't broken). Mirror in `prisma/schema.prisma`.
- Onboarding `/welcome`: after name + phone, collect Account Holder Name*,
  Account Number*, IFSC Code*, UPI ID (optional) with validation.
- `GET/PATCH /api/dashboard/profile`: read/write these fields.
- Dashboard Profile page: editable bank details section.
- Buying a lot is not blocked on bank details (editable later in Profile).

## 6. Admin Users page shows full user details

- `GET /api/admin/users`: join `profiles` for phone + bank details.
- Admin Users page: expandable "View Details" row per user showing phone, account holder,
  account number, IFSC, UPI, Shares, Invested.

## 7. Payout console: bank details + GPay button

- `GET /api/admin/payouts/today`: each payout carries the user's profile + bank details.
- Console rows show bank holder, masked account no., IFSC. When the user has a UPI ID,
  show a "Pay via GPay ₹X" `upi://pay` deep link with the payout amount. No UPI → no button.

## Out of scope

- Renaming DB columns/tables or internal code identifiers from `shares`.
- Renaming customer dashboard/admin UI text (kept as-is by user choice).
- A scheduled cron job; eligibility is enforced at read time with console polling.