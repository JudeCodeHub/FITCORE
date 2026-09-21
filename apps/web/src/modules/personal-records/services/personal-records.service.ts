import { apiFetch } from "@/shared/api-client/http";
import type {
  IPersonalRecord,
  IPersonalRecordInput,
} from "@/modules/personal-records/types/personal-record";

export const personalRecordsService = {
  listMine() {
    return apiFetch<IPersonalRecord[]>("/personal-records/me");
  },

  listBest() {
    return apiFetch<IPersonalRecord[]>("/personal-records/me/best");
  },

  create(input: IPersonalRecordInput) {
    return apiFetch<IPersonalRecord>("/personal-records/me", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return apiFetch<void>(`/personal-records/${id}`, { method: "DELETE" });
  },
};
