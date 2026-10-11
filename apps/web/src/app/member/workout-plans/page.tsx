import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MemberWorkoutPlansPage } from "@/modules/workout-plans";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Training"
        title="Your training plans"
        description="Follow the plan your trainer built or create your own routine."
      />
      <MemberWorkoutPlansPage />
    </div>
  );
}
