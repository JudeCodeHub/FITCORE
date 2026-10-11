import { RoleShell } from "@/shared/components/role-shell";

export default function FrontDeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleShell role="FRONT_DESK">
      <div className="workspace-design">{children}</div>
    </RoleShell>
  );
}
