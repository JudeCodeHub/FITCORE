import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { ComplaintsPage } from "@/modules/complaints";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Support"
        title="Share your feedback"
        description="Tell the team what went well or what could be better."
      />
      <ComplaintsPage />
    </div>
  );
}
