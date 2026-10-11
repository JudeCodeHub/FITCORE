import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { TrainerMemberPhotosPage } from "@/modules/progress-photos";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Member progress"
        title="Progress photos"
        description="Review visual progress and keep a clear history for your member."
      />
      <TrainerMemberPhotosPage />
    </div>
  );
}
