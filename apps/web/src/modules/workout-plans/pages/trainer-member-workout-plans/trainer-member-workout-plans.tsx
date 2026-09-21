"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { exercisesService } from "@/modules/exercises";
import type { IExercise } from "@/modules/exercises";
import { trainerProfilesService } from "@/modules/trainer-profiles";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";
import { WorkoutPlanFormDialog } from "../../components/workout-plan-form-dialog";
import { WorkoutPlansList } from "../../components/workout-plans-list";
import { workoutPlansService } from "../../services/workout-plans.service";
import type {
  ICreateWorkoutPlanInput,
  IUpdateWorkoutPlanInput,
  IWorkoutPlan,
} from "../../types/workout-plan";
import { trainerMemberWorkoutPlansStyles as styles } from "./trainer-member-workout-plans.styles";

export function TrainerMemberWorkoutPlansPage() {
  const { user } = useAuth();
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;

  const [memberName, setMemberName] = useState<string | null>(null);
  const [plans, setPlans] = useState<IWorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IWorkoutPlan | null>(null);

  function refresh() {
    return workoutPlansService.listForMember(memberId).then(setPlans);
  }

  useEffect(() => {
    setError(null);
    Promise.all([
      refresh(),
      exercisesService.listAll().then(setExercises),
      trainerProfilesService.listMyMembers().then((members) => {
        setMemberName(members.find((m) => m.id === memberId)?.name ?? null);
      }),
    ])
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load"),
      )
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  function openCreate() {
    setEditingPlan(null);
    setDialogOpen(true);
  }

  function openEdit(plan: IWorkoutPlan) {
    setEditingPlan(plan);
    setDialogOpen(true);
  }

  async function handleSubmit(
    input: ICreateWorkoutPlanInput | IUpdateWorkoutPlanInput,
  ) {
    if (editingPlan) {
      await workoutPlansService.update(editingPlan.id, input as IUpdateWorkoutPlanInput);
    } else {
      await workoutPlansService.create(input as ICreateWorkoutPlanInput);
    }
    await refresh();
  }

  async function handleDelete(plan: IWorkoutPlan) {
    if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
    await workoutPlansService.remove(plan.id);
    await refresh();
  }

  if (!user) return null;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {memberName ? `${memberName}'s Workout Plans` : "Workout Plans"}
        </h1>
        <Button onClick={openCreate}>New plan</Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <WorkoutPlansList
          plans={plans}
          canEdit={(plan) => plan.createdById === user.id}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <WorkoutPlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        memberId={memberId}
        exercises={exercises}
        editingPlan={editingPlan}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
