import { apiFetch } from "@/shared/api-client/http";
import type {
  IInviteStaffInput,
  IStaffMember,
  StaffRole,
} from "@/modules/staff/types/staff";

export const staffService = {
  list() {
    return apiFetch<IStaffMember[]>("/staff");
  },

  updateRole(id: string, role: StaffRole) {
    return apiFetch<IStaffMember>(`/staff/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  deactivate(id: string) {
    return apiFetch<IStaffMember>(`/staff/${id}/deactivate`, {
      method: "PATCH",
    });
  },

  reactivate(id: string) {
    return apiFetch<IStaffMember>(`/staff/${id}/reactivate`, {
      method: "PATCH",
    });
  },

  invite(input: IInviteStaffInput) {
    return apiFetch<{ message: string }>("/auth/invite-staff", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
