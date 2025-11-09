export interface EconomicInput {
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  domesticCredit: number;
  exports: number;
  imports: number;
  gdpPerCapita: number;           // NEW - Required
  grossFixedCapital: number;      // NEW - Required
}

export interface FoodInput {
  cerealYield: number;
  foodImports: number;
  foodProductionIndex: number;
  gdpGrowth: number;
  gdpPerCapita: number;
  inflation: number;
  populationGrowth: number;
  gdpCurrent: number;             // NEW - Required (total GDP in US$, NOT per capita)
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
  isHighRisk?: boolean;
}

// =====================================================================
// Backend URL Configuration (use environment variables)
// =====================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================================
// VALIDATION HELPER
// =====================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateEconomicInput(data: EconomicInput): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!Number.isFinite(data.gdpGrowth)) errors.push('gdpGrowth must be a valid number');
  if (!Number.isFinite(data.inflation)) errors.push('inflation must be a valid number');
  if (!Number.isFinite(data.unemployment)) errors.push('unemployment must be a valid number');
  if (!Number.isFinite(data.domesticCredit)) errors.push('domesticCredit must be a valid number');
  if (!Number.isFinite(data.exports)) errors.push('exports must be a valid number');
  if (!Number.isFinite(data.imports)) errors.push('imports must be a valid number');
  if (!Number.isFinite(data.gdpPerCapita)) errors.push('gdpPerCapita must be a valid number');
  if (!Number.isFinite(data.grossFixedCapital)) errors.push('grossFixedCapital must be a valid number');

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateFoodInput(data: FoodInput): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!Number.isFinite(data.cerealYield)) errors.push('cerealYield must be a valid number');
  if (!Number.isFinite(data.foodImports)) errors.push('foodImports must be a valid number');
  if (!Number.isFinite(data.foodProductionIndex)) errors.push('foodProductionIndex must be a valid number');
  if (!Number.isFinite(data.gdpGrowth)) errors.push('gdpGrowth must be a valid number');
  if (!Number.isFinite(data.gdpPerCapita)) errors.push('gdpPerCapita must be a valid number');
  if (!Number.isFinite(data.inflation)) errors.push('inflation must be a valid number');
  if (!Number.isFinite(data.populationGrowth)) errors.push('populationGrowth must be a valid number');
  if (!Number.isFinite(data.gdpCurrent)) errors.push('gdpCurrent must be a valid number');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// =====================================================================
// Economic Crisis Analysis - PICKLE VERSION (NO LAGS)
// =====================================================================

export async function analyzeEconomicCrisis(
  country: string,
  data: EconomicInput
): Promise<CrisisResult> {
  try {
    // Validate input data
    const validation = validateEconomicInput(data);
    if (!validation.isValid) {
      console.error('Invalid economic input:', validation.errors);
      return {
        country,
        probability: 0,
        classification: 'Error: Invalid input data',
        topIndicators: [],
      };
    }

    // Prepare request payload (NO LAG FEATURES)
    const payload = {
      country,
      gdpGrowth: data.gdpGrowth,
      inflation: data.inflation,
      unemployment: data.unemployment,
      domesticCredit: data.domesticCredit,
      exports: data.exports,
      imports: data.imports,
      gdpPerCapita: data.gdpPerCapita,           // NEW
      grossFixedCapital: data.grossFixedCapital, // NEW
    };

    console.log('📊 Sending Economic Crisis Analysis Request:', {
      country,
      gdpGrowth: data.gdpGrowth,
      inflation: data.inflation,
      gdpPerCapita: data.gdpPerCapita,
      grossFixedCapital: data.grossFixedCapital,
    });

    const response = await fetch(`${API_BASE_URL}/api/analyze/economic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Economic Analysis Result:', result);

    return result;

  } catch (error) {
    console.error('❌ Economic crisis analysis error:', error);
    return {
      country,
      probability: 0,
      classification: 'Error: Analysis failed',
      topIndicators: [],
    };
  }
}

// =====================================================================
// Food Crisis Analysis - PICKLE VERSION (NO LAGS)
// =====================================================================

export async function analyzeFoodCrisis(
  country: string,
  data: FoodInput
): Promise<CrisisResult> {
  try {
    // Validate input data
    const validation = validateFoodInput(data);
    if (!validation.isValid) {
      console.error('Invalid food input:', validation.errors);
      return {
        country,
        probability: 0,
        classification: 'Error: Invalid input data',
        topIndicators: [],
      };
    }

    // Prepare request payload (NO LAG FEATURES)
    const payload = {
      country,
      cerealYield: data.cerealYield,
      foodImports: data.foodImports,
      foodProductionIndex: data.foodProductionIndex,
      gdpGrowth: data.gdpGrowth,
      gdpPerCapita: data.gdpPerCapita,
      inflation: data.inflation,
      populationGrowth: data.populationGrowth,
      gdpCurrent: data.gdpCurrent,  // NEW
    };

    console.log('🍽️ Sending Food Crisis Analysis Request:', {
      country,
      cerealYield: data.cerealYield,
      foodImports: data.foodImports,
      foodProductionIndex: data.foodProductionIndex,
      gdpCurrent: data.gdpCurrent,
    });

    const response = await fetch(`${API_BASE_URL}/api/analyze/food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Food Analysis Result:', result);

    return result;

  } catch (error) {
    console.error('❌ Food crisis analysis error:', error);
    return {
      country,
      probability: 0,
      classification: 'Error: Analysis failed',
      topIndicators: [],
    };
  }
}

// =====================================================================
// Health Check
// =====================================================================

export async function checkAPIHealth(): Promise<{
  isHealthy: boolean;
  details: {
    apiUrl: string;
    status: string;
    timestamp: string;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    return {
      isHealthy: response.ok,
      details: {
        apiUrl: API_BASE_URL,
        status: response.ok ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      isHealthy: false,
      details: {
        apiUrl: API_BASE_URL,
        status: 'UNREACHABLE',
        timestamp: new Date().toISOString()
      }
    };
  }
}