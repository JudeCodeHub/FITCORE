# analytics module

Home for the Admin Dashboard & Analytics section (spec 3.10). Full
revenue/churn/attendance analytics are Phase 9 — this module currently
holds only the Phase 5 piece:

- `PeakHoursPage` — rendered at `/admin/analytics`. A day-of-week ×
  hour-of-day heatmap of check-in volume, backed by
  `GET /check-ins/peak-hours?days=` (`ADMIN` only). The backend groups
  with a raw SQL `EXTRACT(DOW/HOUR FROM "timestamp" AT TIME ZONE
  'UTC')` query rather than pulling every row into JS, and always
  extracts in UTC so results don't shift with the DB session's
  timezone. Response is a dense 7×24 grid (zero-filled) plus the
  single busiest cell.

Later Phase 9 items (revenue, churn, attendance, staff performance)
will land here as their own pages.
