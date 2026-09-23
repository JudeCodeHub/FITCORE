# staff module

Phase 9 home — role/permission management for staff accounts (spec
3.12's last bullet). `StaffPage`, mounted at `/admin/staff`.

Staff *invitation* already existed (`POST /auth/invite-staff`, part of
`apps/api/src/auth/` since it's really a signup variant) — this module
adds what didn't exist yet: `apps/api/src/staff/` lets an admin list
every `ADMIN`/`TRAINER`/`FRONT_DESK` user, change an existing one's
role, and deactivate/reactivate an account. The invite form on this
page just calls the pre-existing auth endpoint; `staffService` is the
only place this module reaches outside itself.

**Deliberately out of scope:** this can only change the role of an
existing *staff* account among the three staff roles — it can't
promote a `MEMBER` to staff or demote staff to `MEMBER`. A member
converting to staff mid-membership is messy (their bookings, PT
sessions, membership history would all stay attached to a now-staff
account) and isn't what "staff role management" is asking for; new
staff still come in through the invite flow.

**Last-admin protection:** `StaffService` refuses a role change or
deactivation that would leave zero active `ADMIN` accounts — that's a
lockout with no way back in, since only an admin can grant admin.

**Deactivation caveat, stated plainly:** `JwtAuthGuard` only verifies
the JWT's signature and expiry — it never hits the database — so
deactivating someone doesn't invalidate an access token already in
their hand. What it *does* do immediately: revoke every session row
they hold, so their next `POST /auth/refresh` is rejected (in practice
via the existing refresh-token-reuse-detection path, since the token
they'd present is now a revoked one), and block any fresh
`POST /auth/login` outright. The gap is bounded by the access token's
15-minute lifetime — no page was worth rebuilding `JwtAuthGuard` into a
per-request DB check just to close it.
