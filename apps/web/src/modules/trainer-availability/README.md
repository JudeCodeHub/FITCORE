# trainer-availability module

Phase 6 home. The backend (`TrainerAvailability` model, the
`/trainer-availability/*` endpoints, and the booking-time constraint
check) shipped back in Phase 4 — this module is its first frontend.

- `AvailabilitySchedulePage` — rendered at `/trainer/availability`.
  A trainer manages the recurring weekly windows members can book them
  in. Two ways to add a window on the same page: a visual weekly grid
  (read-only overview, hover a block to reveal a remove button) and an
  accessible day/start/end form below it — the form is the only way to
  *create* a window (the grid has no drag-to-create; that was cut to
  keep the interaction keyboard-accessible without a mouse-only
  fallback path). Deleting works from either the grid block or the
  plain list beside it.

**Scope note:** only a trainer can manage their own schedule
(`POST/GET /trainer-availability/me`) — there's no backend support for
an admin editing another trainer's hours (`create` only ever writes to
the caller's own id), so this page doesn't attempt that either.

**Data deps:** `trainerAvailabilityService.listMine()` /
`.create()` / `.remove()`. The public
`GET /trainer-availability/:trainerId` endpoint exists on the backend
for a future member-facing "book this trainer" view but has no
frontend consumer yet.
