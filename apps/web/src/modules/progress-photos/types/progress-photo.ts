export interface IProgressPhoto {
  id: string;
  userId: string;
  photoUrl: string;
  takenAt: string;
  note: string | null;
  createdAt: string;
  url: string;
}

export interface IUploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface ICreateProgressPhotoInput {
  key: string;
  note?: string;
  takenAt?: string;
}
