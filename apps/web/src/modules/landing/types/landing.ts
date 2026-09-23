export interface IStatItem {
  value: string;
  label: string;
}

export interface IPricingTier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}
