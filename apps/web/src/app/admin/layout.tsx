import { RoleShell } from "@/shared/components/role-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleShell role="ADMIN">
      <div className="workspace-design admin-workspace">{children}</div>
    </RoleShell>
  );
}
