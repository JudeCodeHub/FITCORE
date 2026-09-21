# check-in module

Phase 5 home. So far: `MyQrCode`, rendered on the member dashboard from
their own `qrCodeId` (generated per-user back in Phase 1, now actually
exposed via `/auth/me` and displayed). Front-desk scanning, the live
"who's in the gym" dashboard, and check-in history are later checklist
items that will land here too.

**Data deps:** `qrCodeId` comes from the auth context (`useAuth()`),
already included in `/auth/me`, `/auth/login`, and `/auth/signup`
responses — no separate fetch needed.
