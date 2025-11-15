export type CustomerSegment = 'Champion' | 'Loyal' | 'At Risk' | 'Lost' | 'Newcomer';

export interface ShapValue {
  feature: string;
  value: number;
}

export interface CLVData {
  clvEstimate: number;
  confidenceInterval: [number, number];
  // RFM proxies for the insurance dataset
  recency: number; // Mapped from Months Since Last Claim
  frequency: number; // Mapped from Number of Policies
  monetary: number; // Mapped from Monthly Premium Auto
  purchaseProbability: number;
  expectedPurchases: number; // Can represent expected renewals or new policies
  shapValues: ShapValue[];
}

export interface Customer {
  id: string; // Customer ID
  state: string;
  response: string;
  coverage: string;
  education: string;
  employmentStatus: string;
  gender: 'Male' | 'Female';
  income: number;
  locationCode: string;
  maritalStatus: string;
  monthlyPremiumAuto: number;
  monthsSinceLastClaim: number;
  monthsSincePolicyInception: number;
  numberOfOpenComplaints: number;
  numberOfPolicies: number;
  policyType: string;
  policy: string;
  renewOfferType: string;
  salesChannel: string;
  totalClaimAmount: number;
  vehicleClass: string;
  vehicleSize: string;
  segment: CustomerSegment;
  clvData: CLVData;
}

export interface MarketingAction {
  title: string;
  description: string;
  rationale: string;
}
