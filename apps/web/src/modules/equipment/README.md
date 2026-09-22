# equipment module

Phase 8 home. `EquipmentManagementPage` — rendered at `/admin/equipment`.
Standard CRUD table + dialog, following the exact pattern already
established by `modules/plans`.

**Read vs. write split:** `GET /equipment` is open to `ADMIN`,
`TRAINER`, and `FRONT_DESK` (widened from admin-only once
`maintenance-tickets` needed a way for any staff role to pick which
equipment a ticket is about) — but `POST`/`PATCH`/`DELETE` stay
`ADMIN`-only. This page itself is still only routed under `/admin`, so
in practice only admins see this particular UI; the wider read access
exists for `maintenance-tickets`' equipment picker, not for a
trainer/front-desk-facing equipment page (none exists).

- Name, category, purchase date, notes, and `status`
  (`OPERATIONAL` / `OUT_OF_SERVICE` / `RETIRED`).
- Each row has a one-click "Flag out of service" / "Mark operational"
  toggle button (same UX as `plans`' Activate/Deactivate) so staff
  don't need to open the edit dialog just to flag a broken machine —
  that's the literal "out-of-service flagging" half of this checklist
  item. `RETIRED` is reached only through the edit dialog, since it's
  meant as a deliberate decommission, not a quick toggle.
- Delete is a real hard delete (not a soft-delete/deactivate like
  Plans) — `MaintenanceTicket.equipmentId` cascades on delete, so
  removing equipment intentionally takes its ticket history with it.
  `RETIRED` status is the path for equipment whose history should be
  kept.

**Not built here:** the maintenance ticket flow itself (staff logs
issues against a piece of equipment, admin resolves) — that's the next
checklist item, and will read `Equipment` from this same module.
