import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { ComplaintsPage } from "@/modules/complaints";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member experience"
        title="Feedback inbox"
        description="Review complaints and suggestions from your community."
      />
      <ComplaintsPage />
    </div>
  );
}
