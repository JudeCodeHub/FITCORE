import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { CheckInHistoryPage } from "@/modules/check-in";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Visits"
        title="Your visits"
        description="Look back at your check-ins and training rhythm."
      />
      <CheckInHistoryPage />
    </div>
  );
}
