import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { EquipmentManagementPage } from "@/modules/equipment";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Operations / Assets"
        title="Equipment"
        description="Track your gym assets, status, and upcoming maintenance."
      />
      <EquipmentManagementPage />
    </div>
  );
}
