import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { ProgressPage } from "@/modules/body-metrics";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Progress"
        title="Your progress"
        description="Track body metrics and see how far you’ve come."
      />
      <ProgressPage />
    </div>
  );
}
