# check-in module

Phase 5 home. So far:

- `MyQrCode` — rendered on the member dashboard from their own
  `qrCodeId` (generated per-user back in Phase 1, exposed via
  `/auth/me`, `/auth/login`, `/auth/signup`).
- `CheckInDeskPage` — the front-desk check-in screen, rendered at
  `/front-desk`. One auto-focused text input handles both a USB QR
  scanner (which types the code + Enter) and manual entry, backed by
  `POST /check-ins` (looks up by `qrCodeId`, 404s if unknown) and
  `GET /check-ins/recent`.

The live "who's in the gym" dashboard and per-member check-in history
are later checklist items that will land here too.

**Data deps:** `qrCodeId` comes from the auth context (`useAuth()`),
already included in `/auth/me`, `/auth/login`, and `/auth/signup`
responses — no separate fetch needed.
