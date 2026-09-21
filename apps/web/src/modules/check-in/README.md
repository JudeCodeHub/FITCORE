# check-in module

Phase 5 home. So far:

- `MyQrCode` — rendered on the member dashboard from their own
  `qrCodeId` (generated per-user back in Phase 1, exposed via
  `/auth/me`, `/auth/login`, `/auth/signup`).
- `CheckInDeskPage` — the front-desk check-in screen, rendered at
  `/front-desk`. One auto-focused text input handles both a USB QR
  scanner (which types the code + Enter) and manual entry, backed by
  `POST /check-ins` (looks up by `qrCodeId`, 404s if unknown).
- Live "Currently In The Gym" panel on the same page, backed by
  `GET /check-ins/active` (server dedupes to each member's latest
  check-in within a rolling 2-hour window) plus a Socket.IO connection
  to the API's `/check-ins` namespace (`useCheckInSocket`) — every
  check-in anywhere (this terminal or another) pushes a `check-in:new`
  event that updates both the live roster and the "Recent Check-Ins"
  log instantly, no polling needed for new events. A 60s background
  refresh of `/check-ins/active` is kept as a safety net, since a
  member "leaving" the active window is a passage of time, not an
  event the server pushes. The socket connection is staff-only —
  the gateway verifies the JWT + role (`ADMIN`/`FRONT_DESK`) on
  connect and disconnects anyone else.

- `CheckInHistoryPage` — a member's own check-in log, rendered at
  `/member/check-ins`. Backed by `GET /check-ins/me` (any authenticated
  user gets their own history; no role restriction), grouped by day
  ("Today" / "Yesterday" / weekday) with a per-day visit count.

`CheckInsController` has no class-level `@Roles()` — each route
declares its own (`create`, `findRecent`, `findActive` are
`ADMIN`/`FRONT_DESK`; `findMine` has none, so any authenticated role
can hit their own `/me`), matching the pattern in
`MembershipsController`.

**Data deps:** `qrCodeId` comes from the auth context (`useAuth()`),
already included in `/auth/me`, `/auth/login`, and `/auth/signup`
responses — no separate fetch needed.
