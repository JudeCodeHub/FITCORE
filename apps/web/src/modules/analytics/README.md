# analytics module

Home for the Admin Dashboard & Analytics section (spec 3.10). Full
revenue/churn/attendance analytics are Phase 9 — this module currently
holds the Phase 5 and Phase 6 pieces:

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
- `AnalyticsNav` — the small link row both pages share to switch
  between them (this app has no `Tabs` primitive yet, so it's just
  styled `next/link`s with active-state via `usePathname()`).

**Utilization caveat:** if a trainer hasn't set any availability
windows, "hours available" is 0 and `utilizationPercent` comes back
`null` (not `0` or `Infinity`) — the page shows a note explaining why
instead of a misleading percentage.

Later Phase 9 items (revenue, churn, attendance, staff performance)
will land here as their own pages.
