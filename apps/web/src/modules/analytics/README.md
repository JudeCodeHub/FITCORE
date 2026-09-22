# analytics module

Home for the Admin Dashboard & Analytics section (spec 3.10). Holds
the Phase 5, 6, and (now) Phase 9 pieces:

- `PeakHoursPage` — rendered at `/admin/analytics`. A day-of-week ×
  hour-of-day heatmap of check-in volume, backed by
  `GET /check-ins/peak-hours?days=` (`ADMIN` only). The backend groups
  with a raw SQL `EXTRACT(DOW/HOUR FROM "timestamp" AT TIME ZONE
  'UTC')` query rather than pulling every row into JS, and always
  extracts in UTC so results don't shift with the DB session's
  timezone. Response is a dense 7×24 grid (zero-filled) plus the
  single busiest cell.
- `TrainerUtilizationPage` — rendered at `/admin/analytics/trainers`.
  Pick a trainer + a trailing window (30/90/365 days); shows sessions
  run (PT sessions + classes), hours booked, hours available (derived
  from `TrainerAvailability` windows × how many times each weekday
  occurred in the window), and booked/available as a utilization %.
  Backed by `GET /trainer-profiles/:trainerId/utilization?days=`
  (`ADMIN`) — the same query also powers a trainer's own
  `GET /trainer-profiles/me/utilization`, not yet consumed by any
  frontend page.
- `RevenuePage` — rendered at `/admin/analytics/revenue`. Total MRR,
  active membership count, an MRR-trend line chart (last 12 months by
  default, `GET /revenue/mrr-trend?months=`), and a revenue-by-plan
  bar chart + table (`GET /revenue/summary`), both `ADMIN` only.
  **There's no payment ledger yet** (Stripe/Phase 3 is still
  deferred) — MRR is derived entirely from active `Membership` records
  and each plan's price/duration, the same way real MRR dashboards
  compute it even *with* a payment processor (MRR describes recurring
  subscription run-rate, not literal cash received that day). The
  historical trend has one documented approximation: a cancelled
  membership's true stop date isn't stored, so it's estimated as
  `min(endDate, updatedAt)`. The page shows this caveat inline, not
  just in this README.
- `GrowthPage` — rendered at `/admin/analytics/growth`. Current active
  member count, a new-vs-churned-members bar chart, and a churn-rate
  trend line chart (last 12 months by default), backed by
  `GET /memberships/growth-churn?months=` (`ADMIN` only). Shares
  revenue's no-status-history caveat (a cancelled membership's stop
  date is estimated as `min(endDate, updatedAt)`), plus one more rule
  specific to churn: a membership cancelled before its `startDate` ever
  arrived is a withdrawn signup, not a churned member, so it's dropped
  entirely — it counts toward neither new members, active members, nor
  churn.
- `AttendancePage` — rendered at `/admin/analytics/attendance`. Most
  and least popular classes by fill rate over a trailing window
  (90 days default, `GET /classes/attendance-analytics?days=`,
  `ADMIN` only), a fill-rate-by-class bar chart, and a detail table.
  Classes are grouped by `name` — a recurring class's individual
  sessions (sharing one `seriesId`) are the same class type running
  repeatedly, not distinct classes to rank separately. **There's no
  attendance/check-in record tied to a specific class** (`CheckIn` is a
  generic gym entry, not linked to `classId`), so "attended" is
  approximated as BOOKED bookings on classes whose `endTime` has
  already passed; WAITLISTED bookings never held a seat and are
  reported separately as a demand signal, not counted toward fill rate.
  Classes that haven't concluded yet are excluded entirely, regardless
  of how full their booking list is.
- `AnalyticsNav` — the small link row all five pages share to switch
  between them (this app has no `Tabs` primitive yet, so it's just
  styled `next/link`s with active-state via `usePathname()`).

**Utilization caveat:** if a trainer hasn't set any availability
windows, "hours available" is 0 and `utilizationPercent` comes back
`null` (not `0` or `Infinity`) — the page shows a note explaining why
instead of a misleading percentage.

Later Phase 9 items (staff performance) will land here as their own
pages too.
