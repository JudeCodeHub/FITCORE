# progress-photos module

Phase 7 home — the last item. Storage is **real AWS S3** (bucket +
credentials the user provided), not a placeholder.

**Upload flow** (all three steps required, in order):
1. `POST /progress-photos/me/upload-url` — backend returns a
   presigned S3 `PutObject` URL (5 min TTL) scoped to
   `progress-photos/{userId}/{uuid}.{ext}`.
2. Browser `fetch`es that URL directly with `PUT` — the file goes
   straight to S3, never through our API server.
3. `POST /progress-photos/me` — confirms the upload (backend does a
   `HeadObject` check before writing the DB row, so a browser upload
   that failed silently can't create a phantom photo record) and
   creates the `ProgressPhoto` row. `photoUrl` in that table is the
   **S3 key**, not a public URL — there is no public URL, since these
   are private.

**Reading a photo** always re-signs a fresh `GetObject` URL (15 min
TTL) at request time — the DB never stores a browser-usable URL,
matching the model's original design intent (visibility enforced at
the API layer, not baked into stored data).

- `ProgressPhotosSection` — composed into `body-metrics`'
  `ProgressPage` (`/member/progress`), matching the pattern already
  used for `personal-records`. Upload form + a photo grid with delete.
- `TrainerMemberPhotosPage` — `/trainer/members/[memberId]/photos`,
  read-only (no upload button — only the member uploads their own
  photos), linked from "My Members" next to the existing "View plans"
  button. The backend's `assertCanView` enforces the actual
  "member + assigned trainer" rule from the spec — a trainer not
  currently assigned to that member gets 403 even with a valid token.

**Not built:** any admin bulk-browse of all members' photos — spec
only calls for member + assigned trainer visibility, so that's all the
backend exposes.
