# settings module

Phase 9 home — gym profile + cancellation/freeze policy (spec 3.12,
minus plan/pricing management, which already exists in `modules/plans`
and role/permission management, which lives in `modules/staff`).

`SettingsPage`, mounted at `/admin/settings`, edits the one
`GymSettings` row the API keeps (`apps/api/src/settings/`):

- **Gym profile** — name, timezone, and a flat comma-separated list of
  branches (not a full relational model — the spec frames
  multi-location as a maybe, "if multi-location").
- **Hours** — a 7-row editor (`components/hours-editor.tsx`), one
  `Switch` + two time inputs per weekday; toggling a day off sets both
  its `open`/`close` to `null` rather than deleting the day, so the
  server always gets a complete 7-key object.
- **Cancellation & freeze policy** — two numbers,
  `freezeDaysPerYearLimit` and `cancellationNoticeDays`, that
  `apps/api/src/memberships/memberships.service.ts` now reads live via
  `SettingsService.getPolicy()` instead of the hardcoded
  `MAX_FREEZE_DAYS_PER_YEAR = 30` constant it used before. Freezing
  still enforces a per-calendar-year day budget the same way it always
  did — only where that budget's ceiling comes from changed. Cancelling
  an ACTIVE/FROZEN membership now also requires
  `cancellationNoticeDays` days' notice before the membership's
  `endDate` (0, the default, preserves the old unconditional-cancel
  behavior); a still-PENDING membership is exempt, since there's no
  notice concept before a membership has even started.

`GET /settings` is open to any authenticated role (the policy numbers
aren't sensitive, and members benefit from knowing what they're bound
by); `PATCH /settings` is `ADMIN`-only. The row is lazily created with
defaults on first read (`SettingsService.get()` upserts a fixed
`id: "singleton"`), so there's no seed migration to keep in sync.
