import { apiFetch } from "@/shared/api-client/http";
import type {
  IGymSettings,
  IUpdateSettingsInput,
} from "@/modules/settings/types/settings";

export const settingsService = {
  get() {
    return apiFetch<IGymSettings>("/settings");
  },

  update(input: IUpdateSettingsInput) {
    return apiFetch<IGymSettings>("/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
