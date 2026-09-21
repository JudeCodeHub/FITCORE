"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { exercisesService } from "@/modules/exercises";
import type { IExercise } from "@/modules/exercises";
import { useAuth } from "@/shared/auth/auth-context";
import { WorkoutPlanFormDialog } from "../../components/workout-plan-form-dialog";
import { WorkoutPlansList } from "../../components/workout-plans-list";
import { workoutPlansService } from "../../services/workout-plans.service";
import type {
  ICreateWorkoutPlanInput,
  IUpdateWorkoutPlanInput,
  IWorkoutPlan,
} from "../../types/workout-plan";
import { memberWorkoutPlansStyles as styles } from "./member-workout-plans.styles";

export function MemberWorkoutPlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<IWorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IWorkoutPlan | null>(null);

  function refresh() {
    return workoutPlansService.listMine().then(setPlans);
  }

  useEffect(() => {
    Promise.all([refresh(), exercisesService.listAll().then(setExercises)]).finally(
      () => setIsLoading(false),
    );
  }, []);

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
        <h1 className={styles.title}>Workout Plans</h1>
        <Button onClick={openCreate}>New plan</Button>
      </div>

      {isLoading ? (
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
        memberId={user.id}
        exercises={exercises}
        editingPlan={editingPlan}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
