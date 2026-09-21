import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IWorkoutPlan } from "@/modules/workout-plans/types/workout-plan";
import { workoutPlansListStyles as styles } from "./workout-plans-list.styles";

export function WorkoutPlansList({
  plans,
  canEdit,
  onEdit,
  onDelete,
}: {
  plans: IWorkoutPlan[];
  canEdit: (plan: IWorkoutPlan) => boolean;
  onEdit: (plan: IWorkoutPlan) => void;
  onDelete: (plan: IWorkoutPlan) => void;
}) {
  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No workout plans yet.</p>
    );
  }

  return (
    <div className={styles.list}>
      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardContent className="pt-6">
            <div className={styles.header}>
              <div>
                <div className={styles.name}>{plan.name}</div>
                {plan.notes && <p className={styles.notes}>{plan.notes}</p>}
              </div>
              {canEdit(plan) && (
                <div className={styles.actions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(plan)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <div className={styles.exerciseList}>
              {plan.exercises
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((e) => (
                  <div key={e.id} className={styles.exerciseRow}>
                    <span>{e.exercise.name}</span>
                    <Badge variant="outline">
                      {e.sets} × {e.reps}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
