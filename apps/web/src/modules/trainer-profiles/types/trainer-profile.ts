import type { IRating } from "@/modules/reviews";

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
  rating: IRating;
}

export interface ITrainerPublicProfile {
  user: { id: string; name: string };
  profile: ITrainerProfile | null;
  rating: IRating;
}

export interface IAssignedMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface IMemberWithTrainer {
  id: string;
  name: string;
  email: string;
  assignedTrainer: { id: string; name: string } | null;
  hasOverdueBalance: boolean;
  overdueBalances: { currency: string; amount: string }[];
}
