export interface FoodDataRow {
  countryName: string;
  countryCode: string;
  year: number;
  cerealYield?: number;
  foodImports?: number;
  foodProductionIndex?: number;
  gdp?: number;
  gdpGrowth?: number;
  gdpPerCapita?: number;
  inflation?: number;
  populationGrowth?: number;
}

export interface WorldIndicatorRow {
  countryName: string;
  countryCode: string;
  year: number;
  domesticCredit?: number;
  exports?: number;
  gdpGrowth?: number;
  gdpPerCapita?: number;
  grossCapitalFormation?: number;
  imports?: number;
  inflation?: number;
  unemployment?: number;
}

export interface CountryData {
  countryName: string;
  latestData: any;
  historicalFood: any[];
  historicalIndicators: any[];
}

export interface DataStats {
  totalCountries: number;
  totalRecords: number;
  yearRange: { min: number; max: number };
  availableIndicators: string[];
}
