import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { SettingsPage } from "@/modules/settings";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Workspace configuration"
        title="Settings"
        description="Keep your gym profile, opening hours, and access rules up to date."
      />
      <SettingsPage />
    </div>
  );
}
