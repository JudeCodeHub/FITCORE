# complaints module

Phase 9 home — the complaint/suggestion box (spec 3.11). One shared
page, `ComplaintsPage`, mounted at **four** routes since anyone can
submit one, not just staff:

- `/admin/complaints` — the actual inbox
- `/trainer/complaints`
- `/front-desk/complaints`
- `/member/complaints`

Backed by `apps/api/src/complaints/`, which deliberately mirrors
`MaintenanceTicket`'s shape (`OPEN`/`IN_PROGRESS`/`RESOLVED`,
submitter + resolver) since it's the same "someone reports something,
an admin closes it out" pattern — just not tied to a piece of
equipment, and open to every role rather than staff-only.

**Where this diverges from `maintenance-tickets`:** that module's
`GET /maintenance-tickets` is open to all three staff roles, so one
shared list request works for everyone who can reach the page. Here,
`GET /complaints` (the full inbox) is `ADMIN`-only — a member or
trainer has no business seeing what everyone else has sent in — so
non-admins instead call `GET /complaints/me`. `ComplaintsPage` picks
the data source and the page copy based on `user.role === "ADMIN"`:
admins get the filterable inbox with a status `Select` per item;
everyone else gets their own submission history with a read-only
status `Badge`, plus the same submission form at the top either way.
