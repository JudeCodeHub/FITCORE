import { apiFetch } from "@/shared/api-client/http";
import type {
  ICreateProgressPhotoInput,
  IProgressPhoto,
  IUploadUrlResponse,
} from "@/modules/progress-photos/types/progress-photo";

export const progressPhotosService = {
  requestUploadUrl(contentType: string) {
    return apiFetch<IUploadUrlResponse>("/progress-photos/me/upload-url", {
      method: "POST",
      body: JSON.stringify({ contentType }),
    });
  },

  /** Uploads directly to S3 via the presigned URL — never touches our API. */
  async uploadToStorage(uploadUrl: string, file: File) {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) {
      throw new Error("Upload to storage failed");
    }
  },

  create(input: ICreateProgressPhotoInput) {
    return apiFetch<IProgressPhoto>("/progress-photos/me", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listMine() {
    return apiFetch<IProgressPhoto[]>("/progress-photos/me");
  },

  listForMember(memberId: string) {
    return apiFetch<IProgressPhoto[]>(`/progress-photos/member/${memberId}`);
  },

  remove(id: string) {
    return apiFetch<void>(`/progress-photos/${id}`, { method: "DELETE" });
  },
};
