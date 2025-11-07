export interface EconomicInput {
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  domesticCredit: number;
  exports: number;
  imports: number;
}

export interface FoodInput {
  cerealYield: number;
  foodImports: number;
  foodProductionIndex: number;
  gdpGrowth: number;
  gdpPerCapita: number;
  inflation: number;
  populationGrowth: number;
}

export interface Indicator {
  name: string;
  impact: number;
  value: number;
}

export interface CrisisResult {
  country: string;
  probability: number;
  classification: string;
  topIndicators: Indicator[];
}

// =====================================================================
// Backend URL Configuration (use environment variables)
// =====================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================================
// Economic Crisis Analysis
// =====================================================================

export async function analyzeEconomicCrisis(
  country: string,
  data: EconomicInput
): Promise<CrisisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze/economic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country,
        gdpGrowth: data.gdpGrowth,
        inflation: data.inflation,
        unemployment: data.unemployment,
        domesticCredit: data.domesticCredit,
        exports: data.exports,
        imports: data.imports,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Economic crisis analysis error:', error);
    return {
      country,
      probability: 0,
      classification: 'Error: API unavailable',
      topIndicators: [],
    };
  }
}

// =====================================================================
// Food Crisis Analysis
// =====================================================================

export async function analyzeFoodCrisis(
  country: string,
  data: FoodInput
): Promise<CrisisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze/food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country,
        cerealYield: data.cerealYield,
        foodImports: data.foodImports,
        foodProductionIndex: data.foodProductionIndex,
        gdpGrowth: data.gdpGrowth,
        gdpPerCapita: data.gdpPerCapita,
        inflation: data.inflation,
        populationGrowth: data.populationGrowth,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Food crisis analysis error:', error);
    return {
      country,
      probability: 0,
      classification: 'Error: API unavailable',
      topIndicators: [],
    };
  }
}

// =====================================================================
// Health Check (Optional - verify API is running)
// =====================================================================

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const economicResponse = await fetch(`${API_BASE_URL}/health`);
    const foodResponse = await fetch(`${API_BASE_URL}/health`);
    return economicResponse.ok && foodResponse.ok;
  } catch {
    return false;
  }
}