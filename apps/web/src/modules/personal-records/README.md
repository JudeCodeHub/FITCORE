# personal-records module

Phase 7 home. No page of its own — `PersonalRecordsSection` is
composed directly into `body-metrics`' `ProgressPage`
(`/member/progress`), since the spec groups body metrics and PR
tracking under the same "Progress" concept and the nav only has one
slot for it.

- Logs a lift (exercise + weight + reps) via `POST
  /personal-records/me`. Every attempt is stored — this is a log, not
  a single "current PR" row per exercise.
- **Current PR per exercise** comes from `GET
  /personal-records/me/best`, which the backend computes by comparing
  **estimated one-rep max** (Epley formula: `weight × (1 + reps/30)`)
  across all of a user's logged attempts for that exercise — not raw
  weight. A 110kg × 1 single doesn't automatically beat a 100kg × 5
  set; whichever implies the higher 1RM wins. The "Current PRs" cards
  show both the actual lift and its estimated 1RM so this isn't
  opaque.
- The full log (`GET /personal-records/me`) is also shown as a history
  table below the PR cards, each row deletable.

**Not built here:** any trainer/admin view of a member's PRs — like
`body-metrics`, the spec doesn't call out trainer visibility for this
model, so the backend only exposes `/personal-records/me`.
