// Crisis Analysis Logic based on research models

export interface EconomicCrisisIndicators {
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  domesticCredit: number;
  exports: number;
  imports: number;
}

export interface FoodCrisisIndicators {
  cerealYield: number;
  foodImports: number;
  foodProductionIndex: number;
  gdpGrowth: number;
  gdpPerCapita: number;
  inflation: number;
  populationGrowth: number;
}

export interface CrisisResult {
  country: string;
  probability: number;
  riskLevel: "None" | "Low" | "Moderate" | "Severe";
  topIndicators: Array<{
    name: string;
    value: number;
    impact: number;
  }>;
}

// Economic Crisis Detection (Model 1 - Based on research)
// Crisis conditions:
// 1. GDP growth < 0 (contraction)
// 2. Inflation > 20 (serious inflation)
// 3. Unemployment > 10 (high unemployment)
// 4. Domestic credit > 100 (excessive private credit)
// 5. Exports < 15 (weak exports)
// 6. (Imports - Exports) > 20 (large trade gap)
export function analyzeEconomicCrisis(
  country: string,
  indicators: EconomicCrisisIndicators
): CrisisResult {
  let crisisScore = 0;
  const contributingFactors: Array<{ name: string; value: number; impact: number }> = [];

  // 1. GDP contraction
  if (indicators.gdpGrowth < 0) {
    const impact = Math.abs(indicators.gdpGrowth);
    crisisScore++;
    contributingFactors.push({
      name: "GDP Growth (Contraction)",
      value: indicators.gdpGrowth,
      impact: impact,
    });
  }

  // 2. Serious inflation
  if (indicators.inflation > 20) {
    const impact = indicators.inflation - 20;
    crisisScore++;
    contributingFactors.push({
      name: "Inflation Rate (High)",
      value: indicators.inflation,
      impact: impact,
    });
  }

  // 3. High unemployment
  if (indicators.unemployment > 10) {
    const impact = indicators.unemployment - 10;
    crisisScore++;
    contributingFactors.push({
      name: "Unemployment Rate (High)",
      value: indicators.unemployment,
      impact: impact,
    });
  }

  // 4. Excessive private credit
  if (indicators.domesticCredit > 100) {
    const impact = indicators.domesticCredit - 100;
    crisisScore++;
    contributingFactors.push({
      name: "Domestic Credit (Excessive)",
      value: indicators.domesticCredit,
      impact: impact,
    });
  }

  // 5. Weak exports
  if (indicators.exports < 15) {
    const impact = 15 - indicators.exports;
    crisisScore++;
    contributingFactors.push({
      name: "Exports (Weak)",
      value: indicators.exports,
      impact: impact,
    });
  }

  // 6. Large trade gap
  const tradeGap = indicators.imports - indicators.exports;
  if (tradeGap > 20) {
    const impact = tradeGap - 20;
    crisisScore++;
    contributingFactors.push({
      name: "Trade Balance (Deficit)",
      value: tradeGap,
      impact: impact,
    });
  }

  // Sort by impact and take top 3
  const topIndicators = contributingFactors
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  // Calculate probability based on crisis score (0-100%)
  // Model: Crisis_Flag = 1 if score >= 2, else 0
  const probability = Math.min(100, (crisisScore / 6) * 100);

  // Determine risk level based on model categorization
  let riskLevel: "None" | "Low" | "Moderate" | "Severe" = "None";
  if (crisisScore >= 4) riskLevel = "Severe";
  else if (crisisScore >= 2) riskLevel = "Moderate";
  else if (crisisScore === 1) riskLevel = "Low";

  return {
    country,
    probability,
    riskLevel,
    topIndicators,
  };
}

// Food Crisis Detection (Model 2 - Based on research)
// Crisis conditions (7 total):
// 1. Cereal yield < 1000 kg/ha (low yield)
// 2. Food imports > 15% (high imports)
// 3. Food production index < 100 (low production)
// 4. GDP growth < 2% (low GDP growth)
// 5. GDP per capita < $784 (poverty line - $2.15/day)
// 6. Inflation > 10% (high inflation)
// 7. Population growth > 2.5% (high population growth)
export function analyzeFoodCrisis(
  country: string,
  indicators: FoodCrisisIndicators
): CrisisResult {
  let crisisCount = 0;
  const contributingFactors: Array<{ name: string; value: number; impact: number }> = [];

  // 1. Low cereal yield
  if (indicators.cerealYield < 1000) {
    const impact = 1000 - indicators.cerealYield;
    crisisCount++;
    contributingFactors.push({
      name: "Cereal Yield (Low)",
      value: indicators.cerealYield,
      impact: impact,
    });
  }

  // 2. High food imports dependency
  if (indicators.foodImports > 15) {
    const impact = indicators.foodImports - 15;
    crisisCount++;
    contributingFactors.push({
      name: "Food Imports (High Dependency)",
      value: indicators.foodImports,
      impact: impact,
    });
  }

  // 3. Low food production
  if (indicators.foodProductionIndex < 100) {
    const impact = 100 - indicators.foodProductionIndex;
    crisisCount++;
    contributingFactors.push({
      name: "Food Production Index (Low)",
      value: indicators.foodProductionIndex,
      impact: impact,
    });
  }

  // 4. Low GDP growth
  if (indicators.gdpGrowth < 2) {
    const impact = 2 - indicators.gdpGrowth;
    crisisCount++;
    contributingFactors.push({
      name: "GDP Growth (Low)",
      value: indicators.gdpGrowth,
      impact: impact,
    });
  }

  // 5. Low GDP per capita (poverty line $784)
  if (indicators.gdpPerCapita < 784) {
    const impact = 784 - indicators.gdpPerCapita;
    crisisCount++;
    contributingFactors.push({
      name: "GDP Per Capita (Below Poverty Line)",
      value: indicators.gdpPerCapita,
      impact: impact,
    });
  }

  // 6. High inflation
  if (indicators.inflation > 10) {
    const impact = indicators.inflation - 10;
    crisisCount++;
    contributingFactors.push({
      name: "Inflation Rate (High)",
      value: indicators.inflation,
      impact: impact,
    });
  }

  // 7. High population growth
  if (indicators.populationGrowth > 2.5) {
    const impact = indicators.populationGrowth - 2.5;
    crisisCount++;
    contributingFactors.push({
      name: "Population Growth (High Pressure)",
      value: indicators.populationGrowth,
      impact: impact,
    });
  }

  // Sort by impact and take top 3
  const topIndicators = contributingFactors
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  // Calculate probability based on crisis count (0-100%)
  // Model: Crisis_Label = 1 if count >= 3, else 0
  const probability = Math.min(100, (crisisCount / 7) * 100);

  // Determine risk level based on model categorization
  let riskLevel: "None" | "Low" | "Moderate" | "Severe" = "None";
  if (crisisCount >= 5) riskLevel = "Severe";
  else if (crisisCount >= 3) riskLevel = "Moderate";
  else if (crisisCount >= 1) riskLevel = "Low";

  return {
    country,
    probability,
    riskLevel,
    topIndicators,
  };
}

