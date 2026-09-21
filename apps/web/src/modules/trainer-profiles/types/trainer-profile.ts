export interface ITrainerProfile {
  id: string;
  userId: string;
  bio: string | null;
  specialties: string[];
  certifications: string[];
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITrainerProfileInput {
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  photoUrl?: string;
}

export interface ITrainerSummary {
  id: string;
  name: string;
  trainerProfile: ITrainerProfile | null;
}

export interface ITrainerPublicProfile {
  user: { id: string; name: string };
  profile: ITrainerProfile | null;
}
