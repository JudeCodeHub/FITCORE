# trainer-profiles module

Phase 6 home. So far:

- `TrainerProfileEditorPage` — rendered at `/trainer/profile`. A trainer
  edits their own bio, specialties, certifications, and photo. Backed
  by `PUT /trainer-profiles/me` (upsert — safe to call whether or not
  a profile row exists yet) and `GET /trainer-profiles/me`.
- `MyMembersPage` — rendered at `/trainer/members`. A trainer's
  read-only list of members assigned to them (`GET
  /trainer-profiles/me/members`).
- `MemberAssignmentsPage` — rendered at `/admin/members`. Admin-only:
  every member, each with a dropdown to assign/reassign/unassign their
  trainer (`GET /trainer-profiles/members`, `PUT`/`DELETE
  /trainer-profiles/:trainerId/members/:memberId`). This seeded
  `/admin/members` (previously an unbuilt nav placeholder) scoped
  tightly to trainer assignment — a fuller member-management feature
  (editing member details, membership status, etc.) isn't itemized
  anywhere yet and can extend this same page later.

**Assignment model:** `User.assignedTrainerId` is a nullable
self-relation, set directly on the member's row — one trainer per
member, admin-managed. There's no separate assignment/history table;
reassigning just overwrites the pointer.

**Photo storage:** `photoUrl` is a plain URL string the trainer pastes
in, not a file upload. There's no object storage (S3/Cloudinary) wired
up yet — that's a Phase 8/10 infra concern per the spec. When it lands,
an upload flow can just write its resulting URL into this same field
without a schema change.

**Not yet built (service methods exist, ready to consume):**
`trainerProfilesService.listAll()` (`GET /trainer-profiles`, all
trainers + their profiles) and `getByTrainerId()`
(`GET /trainer-profiles/:trainerId`, one trainer's public profile) —
for whenever a "browse trainers" or "trainer detail" view is built for
members (not itself a checklist item yet).
