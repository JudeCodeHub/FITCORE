# body-metrics module

Phase 7 home. `ProgressPage` — rendered at `/member/progress` (the nav
item already existed as an unbuilt placeholder; this is the first
feature to actually fill it — later Phase 7 items like the PR tracker
and progress photos may extend this same page or get their own).

- Logs weight, optional height, optional body-fat %, and optional
  free-form measurements (`waist:85, chest:100` parsed into a JSON
  object, matching the comma-separated-list pattern already used for
  plan features).
- **BMI is never entered — it comes back computed from the API**
  (`GET/POST /body-metrics/me`), consistent with the schema decision
  that `BodyMetric` never stores a `bmi` column.
- **Height inheritance:** if a log entry omits height, the backend
  reuses the most recently recorded height on file, so a member only
  has to enter it once. The form's height field just shows that value
  as a placeholder hint ("Last: 178") rather than requiring re-entry.
- History table sorts by `recordedAt` (when the measurement happened),
  not `createdAt` (when the row was inserted) — logging a backdated
  entry places it correctly in the timeline.

**Not built here:** any trainer-facing view of a member's body
metrics. Unlike `ProgressPhoto`, the spec doesn't call out
trainer visibility for this model, so the backend only exposes
`/body-metrics/me` — no trainer/admin read endpoint exists to build a
frontend for yet.
