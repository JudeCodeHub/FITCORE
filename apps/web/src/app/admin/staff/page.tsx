import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { StaffPage } from "@/modules/staff";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="People & access"
        title="Staff"
        description="Invite your team and manage their workspace access."
      />
      <StaffPage />
    </div>
  );
}
