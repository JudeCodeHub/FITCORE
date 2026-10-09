import { apiFetch } from "@/shared/api-client/http";
import type {
  IEquipment,
  IEquipmentInput,
} from "@/modules/equipment/types/equipment";

export const equipmentService = {
  list() {
    return apiFetch<IEquipment[]>("/equipment");
  },

  create(input: IEquipmentInput) {
    return apiFetch<IEquipment>("/equipment", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: Partial<IEquipmentInput>) {
    return apiFetch<IEquipment>(`/equipment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  completeMaintenance(id: string, notes?: string) {
    return apiFetch(`/equipment/${id}/maintenance-completions`, {
      method: 'POST', body: JSON.stringify({ notes }),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/equipment/${id}`, { method: "DELETE" });
  },
};
