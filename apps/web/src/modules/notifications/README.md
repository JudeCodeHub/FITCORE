# notifications module

Phase 8 home. Unlike every other feature module this session,
`NotificationBell` has no page or route of its own — it's mounted
directly in `components/layout/topbar.tsx`, which renders inside
`AppShell` for **every** role. Notifications are inherently
cross-role, so the bell lives in the one shared layout piece all four
roles already share, rather than being duplicated as four separate
per-role pages.

- Bell icon + unread-count badge in the topbar; count refreshes every
  30s in the background (a cheap `count()` query, not a websocket —
  real-time push wasn't asked for here, unlike the Phase 5 check-in
  dashboard which explicitly was).
- Clicking it opens a `Sheet` (slide-in panel) listing the user's own
  notifications newest-first. Clicking a notification marks it read;
  each has its own "Remove" (delete) action; there's a "Mark all read"
  button when any are unread.
- `POST /notifications` (creating one for an arbitrary user) is
  `ADMIN`-only and has no dedicated UI yet — it exists on the backend
  so an admin-announcement feature or the next checklist item's event
  triggers (booking confirmations, renewal reminders, etc.) can call it
  without needing a new endpoint. `NotificationsService` is exported
  from its Nest module for exactly that reason.

**Ownership is obscured, not just denied:** trying to mark-read or
delete another user's notification returns 404, not 403 — the backend
never confirms a given notification id exists for someone else.
