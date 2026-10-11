import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MaintenanceTicketsPage } from "@/modules/maintenance-tickets";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Operations / Maintenance"
        title="Maintenance tickets"
        description="Review equipment issues and keep resolution moving."
      />
      <MaintenanceTicketsPage />
    </div>
  );
}
