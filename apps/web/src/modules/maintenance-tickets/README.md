# maintenance-tickets module

Phase 8 home. One shared page, `MaintenanceTicketsPage`, mounted at
**three** routes since the checklist's own framing — "staff logs,
admin resolves" — means `ADMIN`, `TRAINER`, and `FRONT_DESK` all need
access, just with different capabilities once there:

- `/admin/maintenance-tickets`
- `/trainer/maintenance-tickets`
- `/front-desk/maintenance-tickets`

The component itself adapts via `useAuth()` — `user.role === "ADMIN"`
gates the per-ticket status `Select` and the delete button. Non-admin
staff get a read-only status `Badge` instead; they can log new tickets
and filter the list, but not change or remove anything, matching the
backend's own split (`POST` is any staff role, `PATCH`/`DELETE` are
`ADMIN`-only).

**Side effect worth knowing:** building this required widening
`GET /equipment` (previously `ADMIN`-only) to all three staff roles,
since a trainer or front-desk person logging a ticket needs to pick
*which* equipment it's about. Write access to `/equipment` is still
`ADMIN`-only — see `modules/equipment`'s README for the exact split.

**Design choice — no automatic equipment status changes:** logging a
ticket does *not* automatically flag the equipment `OUT_OF_SERVICE`,
and resolving a ticket does not automatically restore it to
`OPERATIONAL`. Not every reported issue takes a machine fully out of
action, and a piece of equipment can have more than one open ticket at
once — so equipment status stays a manual, separate action on the
`/admin/equipment` page, deliberately decoupled from ticket status.
