import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MaintenanceTicketsPage } from "@/modules/maintenance-tickets";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Operations"
        title="Maintenance tickets"
        description="Flag equipment issues so the team can address them."
      />
      <MaintenanceTicketsPage />
    </div>
  );
}
