# workout-plans module

Phase 7 home. The shared builder — one form (`WorkoutPlanFormDialog`) and
one list (`WorkoutPlansList`) in `components/`, used by two pages that
differ only in whose plans they show:

- `MemberWorkoutPlansPage` — rendered at `/member/workout-plans`. A
  member's own plans, self-service create/edit/delete
  (`memberId` is always the logged-in user).
- `TrainerMemberWorkoutPlansPage` — rendered at
  `/trainer/members/[memberId]/plans`, linked from "My Members". A
  trainer building/managing plans for one of their assigned members
  (`memberId` comes from the route).

Both call the same `workoutPlansService` (`GET/POST /workout-plans*`,
`PATCH`/`DELETE /workout-plans/:id`). The backend enforces who can do
what — a trainer can only create plans for members assigned to them
(`assignedTrainerId`), a member can only create for themselves, and
only a plan's own creator (or `ADMIN`) can edit or delete it, even
though the member, the creator, and the member's *current* assigned
trainer can all view it. The frontend doesn't re-implement these
rules; `canEdit` on `WorkoutPlansList` just checks
`plan.createdById === currentUserId` for showing the Edit/Delete
buttons, and a real permission mismatch surfaces as a normal API error
from the dialog.

**Exercise picker:** pulls from the `exercises` module
(`exercisesService.listAll()` → `GET /exercises`, open to any
authenticated role).

**Update semantics:** `PATCH` with an `exercises` array is a full
replace, not a merge — the backend deletes the plan's existing
`WorkoutPlanExercise` rows and recreates them in one transaction. The
dialog always sends the complete current row list.
