# trainer-profiles module

Phase 6 home. So far:

- `TrainerProfileEditorPage` — rendered at `/trainer/profile`. A trainer
  edits their own bio, specialties, certifications, and photo. Backed
  by `PUT /trainer-profiles/me` (upsert — safe to call whether or not
  a profile row exists yet) and `GET /trainer-profiles/me`.

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
