import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MaintenanceTicketsPage } from "@/modules/maintenance-tickets";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Front desk / Operations"
        title="Maintenance tickets"
        description="Report equipment issues and follow their progress."
      />
      <MaintenanceTicketsPage />
    </div>
  );
}
