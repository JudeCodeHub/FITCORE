export interface IBodyMetric {
  id: string;
  userId: string;
  recordedAt: string;
  weightKg: number;
  heightCm: number | null;
  bodyFatPct: number | null;
  measurements: Record<string, number> | null;
  createdAt: string;
  bmi: number | null;
}

export interface IBodyMetricInput {
  weightKg: number;
  heightCm?: number;
  bodyFatPct?: number;
  measurements?: Record<string, number>;
  recordedAt?: string;
}
