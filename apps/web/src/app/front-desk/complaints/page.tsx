import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { ComplaintsPage } from "@/modules/complaints";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Front desk / Feedback"
        title="Feedback"
        description="Share a complaint or suggestion with the admin team."
      />
      <ComplaintsPage />
    </div>
  );
}
