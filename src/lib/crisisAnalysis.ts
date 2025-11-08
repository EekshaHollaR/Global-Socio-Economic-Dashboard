export interface EconomicInput {
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  domesticCredit: number;
  exports: number;
  imports: number;
  
  gdpGrowthLag?: number;          // Previous year GDP growth
  inflationLag?: number;           // Previous year inflation
}

export interface FoodInput {
  cerealYield: number;
  foodImports: number;
  foodProductionIndex: number;
  gdpGrowth: number;
  gdpPerCapita: number;
  inflation: number;
  populationGrowth: number;
  
  // LAG FEATURES (NEW) - Optional, will fallback to current values if not provided
  cerealYieldLag?: number;         // Previous year cereal yield
  foodImportsLag?: number;         // Previous year food imports
  foodProductionLag?: number;      // Previous year food production (CRITICAL)
  gdpGrowthLag?: number;           // Previous year GDP growth
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
  
  // NEW METADATA - for debugging
  debug?: {
    lagFeaturesProvided: boolean;
    lagValuesUsed: {
      [key: string]: number | null;
    };
  };
}

// =====================================================================
// Backend URL Configuration (use environment variables)
// =====================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================================
// VALIDATION HELPER (NEW)
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

  // Optional lag fields - validate if provided
  if (data.gdpGrowthLag !== undefined && !Number.isFinite(data.gdpGrowthLag)) {
    errors.push('gdpGrowthLag must be a valid number if provided');
  }
  if (data.inflationLag !== undefined && !Number.isFinite(data.inflationLag)) {
    errors.push('inflationLag must be a valid number if provided');
  }

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

  // Optional lag fields - validate if provided
  if (data.cerealYieldLag !== undefined && !Number.isFinite(data.cerealYieldLag)) {
    errors.push('cerealYieldLag must be a valid number if provided');
  }
  if (data.foodImportsLag !== undefined && !Number.isFinite(data.foodImportsLag)) {
    errors.push('foodImportsLag must be a valid number if provided');
  }
  if (data.foodProductionLag !== undefined && !Number.isFinite(data.foodProductionLag)) {
    errors.push('foodProductionLag must be a valid number if provided');
  }
  if (data.gdpGrowthLag !== undefined && !Number.isFinite(data.gdpGrowthLag)) {
    errors.push('gdpGrowthLag must be a valid number if provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// =====================================================================
// Economic Crisis Analysis - UPDATED
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
        debug: {
          lagFeaturesProvided: false,
          lagValuesUsed: {}
        }
      };
    }

    // Prepare request payload with lag features
    const payload = {
      country,
      gdpGrowth: data.gdpGrowth,
      inflation: data.inflation,
      unemployment: data.unemployment,
      domesticCredit: data.domesticCredit,
      exports: data.exports,
      imports: data.imports,
      
      // LAG FEATURES (NEW) - Will use current values as fallback if not provided
      gdpGrowthLag: data.gdpGrowthLag ?? data.gdpGrowth,    // Fallback to current
      inflationLag: data.inflationLag ?? data.inflation,     // Fallback to current
    };

    console.log('📊 Sending Economic Crisis Analysis Request:', {
      country,
      hasLags: (data.gdpGrowthLag !== undefined || data.inflationLag !== undefined),
      lagValues: {
        gdpGrowthLag: data.gdpGrowthLag,
        inflationLag: data.inflationLag
      }
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
    
    return {
      ...result,
      debug: {
        lagFeaturesProvided: (data.gdpGrowthLag !== undefined || data.inflationLag !== undefined),
        lagValuesUsed: {
          gdpGrowthLag: data.gdpGrowthLag ?? null,
          inflationLag: data.inflationLag ?? null
        }
      }
    };

  } catch (error) {
    console.error('❌ Economic crisis analysis error:', error);
    return {
      country,
      probability: 0,
      classification: 'Error: Analysis failed',
      topIndicators: [],
      debug: {
        lagFeaturesProvided: false,
        lagValuesUsed: {}
      }
    };
  }
}

// =====================================================================
// Food Crisis Analysis - UPDATED
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
        debug: {
          lagFeaturesProvided: false,
          lagValuesUsed: {}
        }
      };
    }

    // Prepare request payload with lag features (CRITICAL FOR FOOD MODEL)
    const payload = {
      country,
      cerealYield: data.cerealYield,
      foodImports: data.foodImports,
      foodProductionIndex: data.foodProductionIndex,
      gdpGrowth: data.gdpGrowth,
      gdpPerCapita: data.gdpPerCapita,
      inflation: data.inflation,
      populationGrowth: data.populationGrowth,
      
      // LAG FEATURES (NEW - CRITICAL!) - Will use current values as fallback
      cerealYieldLag: data.cerealYieldLag ?? data.cerealYield,
      foodImportsLag: data.foodImportsLag ?? data.foodImports,
      foodProductionLag: data.foodProductionLag ?? data.foodProductionIndex,  // ← CRITICAL
      gdpGrowthLag: data.gdpGrowthLag ?? data.gdpGrowth,
    };

    console.log('🍽️ Sending Food Crisis Analysis Request:', {
      country,
      hasLags: (
        data.cerealYieldLag !== undefined ||
        data.foodImportsLag !== undefined ||
        data.foodProductionLag !== undefined ||
        data.gdpGrowthLag !== undefined
      ),
      lagValues: {
        cerealYieldLag: data.cerealYieldLag,
        foodImportsLag: data.foodImportsLag,
        foodProductionLag: data.foodProductionLag,
        gdpGrowthLag: data.gdpGrowthLag
      }
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
    
    return {
      ...result,
      debug: {
        lagFeaturesProvided: (
          data.cerealYieldLag !== undefined ||
          data.foodImportsLag !== undefined ||
          data.foodProductionLag !== undefined ||
          data.gdpGrowthLag !== undefined
        ),
        lagValuesUsed: {
          cerealYieldLag: data.cerealYieldLag ?? null,
          foodImportsLag: data.foodImportsLag ?? null,
          foodProductionLag: data.foodProductionLag ?? null,
          gdpGrowthLag: data.gdpGrowthLag ?? null
        }
      }
    };

  } catch (error) {
    console.error('❌ Food crisis analysis error:', error);
    return {
      country,
      probability: 0,
      classification: 'Error: Analysis failed',
      topIndicators: [],
      debug: {
        lagFeaturesProvided: false,
        lagValuesUsed: {}
      }
    };
  }
}

// =====================================================================
// Health Check (Optional - verify API is running)
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

// =====================================================================
// HELPER: Build payload with historical data (NEW)
// =====================================================================

/**
 * Helper function to build economic input with lag features
 * Use this in your components to ensure lag data is included
 */
export function buildEconomicInput(
  current: {
    gdpGrowth: number;
    inflation: number;
    unemployment: number;
    domesticCredit: number;
    exports: number;
    imports: number;
  },
  previous?: {
    gdpGrowth?: number;
    inflation?: number;
  }
): EconomicInput {
  return {
    ...current,
    gdpGrowthLag: previous?.gdpGrowth,
    inflationLag: previous?.inflation,
  };
}

/**
 * Helper function to build food input with lag features
 * Use this in your components to ensure lag data is included
 */
export function buildFoodInput(
  current: {
    cerealYield: number;
    foodImports: number;
    foodProductionIndex: number;
    gdpGrowth: number;
    gdpPerCapita: number;
    inflation: number;
    populationGrowth: number;
  },
  previous?: {
    cerealYield?: number;
    foodImports?: number;
    foodProductionIndex?: number;
    gdpGrowth?: number;
  }
): FoodInput {
  return {
    ...current,
    cerealYieldLag: previous?.cerealYield,
    foodImportsLag: previous?.foodImports,
    foodProductionLag: previous?.foodProductionIndex,
    gdpGrowthLag: previous?.gdpGrowth,
  };
}