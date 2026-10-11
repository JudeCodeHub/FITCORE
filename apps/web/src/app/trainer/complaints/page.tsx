import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { ComplaintsPage } from "@/modules/complaints";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Support"
        title="Share feedback"
        description="Send a suggestion or report an issue to the admin team."
      />
      <ComplaintsPage />
    </div>
  );
}
