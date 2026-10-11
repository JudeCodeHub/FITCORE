import { AdminPageBanner } from "@/components/layout/admin-page-banner";
import { MemberAssignmentsPage } from "@/modules/trainer-profiles";

export default function Page() {
  return (
    <div>
      <AdminPageBanner
        eyebrow="People & memberships"
        title="Members"
        description="Manage member records, trainer assignments, and account status."
      />
      <MemberAssignmentsPage />
    </div>
  );
}
