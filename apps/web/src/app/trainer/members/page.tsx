import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MyMembersPage } from "@/modules/trainer-profiles";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / People"
        title="Your members"
        description="See the members you coach and open their plans or progress photos."
      />
      <MyMembersPage />
    </div>
  );
}
