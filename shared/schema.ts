// Type definitions for the diabetes cost tracker
// No database needed - all data is embedded in the frontend

export interface InsulinProduct {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  type: "rapid-acting" | "short-acting" | "intermediate" | "long-acting" | "mixed" | "biosimilar" | "combination";
  forms: string[];
  retailPriceVial: string;
  retailPricePen: string;
  retailNotes: string;
  insuranceCopay: string;
  insuranceTier: string;
  insuranceNotes: string;
  medicareCovered: boolean;
  medicareCopay: string;
  medicareNotes: string;
  ira35Cap: boolean;
  patientAssistance: string;
  sourceUrls: string[];
}

export interface CGMProduct {
  id: string;
  name: string;
  manufacturer: string;
  sensorCostPerUnit: string;
  monthlyCostNoInsurance: string;
  transmitterCost: string;
  readerCost: string;
  insuranceCopay: string;
  insuranceNotes: string;
  medicareCovered: boolean;
  medicarePartBCopay: string;
  medicareNotes: string;
  otcAvailable: boolean;
  wearTime: string;
  features: string[];
  sourceUrls: string[];
}

export interface PumpProduct {
  id: string;
  name: string;
  manufacturer: string;
  pumpCost: string;
  monthlySupplyCost: string;
  firstYearCostNoInsurance: string;
  insurancePumpCopay: string;
  insuranceMonthlyCopay: string;
  insuranceNotes: string;
  medicareCovered: boolean;
  medicarePumpCost: string;
  medicareMonthlySupply: string;
  medicareNotes: string;
  warrantyYears: number;
  closedLoop: boolean;
  tubeless: boolean;
  cgmIntegration: string[];
  features: string[];
  sourceUrls: string[];
}

export interface NewsSource {
  name: string;
  category: "government" | "pharma" | "media";
  url: string;
  description: string;
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
  category: "pricing" | "devices" | "coverage" | "legislation" | "research";
  summary: string;
}
