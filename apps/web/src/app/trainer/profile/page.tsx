import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { TrainerProfileEditorPage } from "@/modules/trainer-profiles";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Profile"
        title="Your trainer profile"
        description="Keep your introduction, specialties, and profile photo up to date."
      />
      <TrainerProfileEditorPage />
    </div>
  );
}
