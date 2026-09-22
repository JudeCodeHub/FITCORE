export type EquipmentStatus = "OPERATIONAL" | "OUT_OF_SERVICE" | "RETIRED";

export interface IEquipment {
  id: string;
  name: string;
  category: string;
  purchaseDate: string | null;
  status: EquipmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IEquipmentInput {
  name: string;
  category: string;
  purchaseDate?: string;
  status?: EquipmentStatus;
  notes?: string;
}
