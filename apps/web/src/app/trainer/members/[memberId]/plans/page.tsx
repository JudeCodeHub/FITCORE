import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { TrainerMemberWorkoutPlansPage } from "@/modules/workout-plans";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Member training"
        title="Workout plans"
        description="Build and manage a training plan for this member."
      />
      <TrainerMemberWorkoutPlansPage />
    </div>
  );
}
