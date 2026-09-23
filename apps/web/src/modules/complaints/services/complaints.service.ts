import { apiFetch } from "@/shared/api-client/http";
import type {
  ComplaintStatus,
  IComplaint,
  ICreateComplaintInput,
} from "@/modules/complaints/types/complaint";

export const complaintsService = {
  listAll(status?: ComplaintStatus) {
    const query = status ? `?status=${status}` : "";
    return apiFetch<IComplaint[]>(`/complaints${query}`);
  },

  listMine() {
    return apiFetch<IComplaint[]>("/complaints/me");
  },

  create(input: ICreateComplaintInput) {
    return apiFetch<IComplaint>("/complaints", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateStatus(id: string, status: ComplaintStatus) {
    return apiFetch<IComplaint>(`/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
