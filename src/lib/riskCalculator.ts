/**
 * Risk Calculation Utility
 * Calculates crisis risk scores for countries based on multiple indicators
 */

interface CountryRiskData {
    gdpGrowth?: number;
    inflation?: number;
    unemployment?: number;
    foodProductionIndex?: number;
    foodImports?: number;
    populationGrowth?: number;
}

export function calculateRiskScore(data: CountryRiskData): number {
    let riskScore = 0;
    let factorCount = 0;

    // Economic Risk Factors
    if (data.gdpGrowth !== undefined && !isNaN(data.gdpGrowth)) {
        factorCount++;
        if (data.gdpGrowth < -3) riskScore += 30; // Severe recession
        else if (data.gdpGrowth < 0) riskScore += 15; // Recession
        else if (data.gdpGrowth < 2) riskScore += 10; // Low growth
    }

    if (data.inflation !== undefined && !isNaN(data.inflation)) {
        factorCount++;
        if (data.inflation > 20) riskScore += 25; // Hyperinflation
        else if (data.inflation > 10) riskScore += 15; // High inflation
        else if (data.inflation > 5) riskScore += 5; // Elevated inflation
    }

    if (data.unemployment !== undefined && !isNaN(data.unemployment)) {
        factorCount++;
        if (data.unemployment > 20) riskScore += 20; // Critical unemployment
        else if (data.unemployment > 10) riskScore += 10; // High unemployment
        else if (data.unemployment > 7) riskScore += 5; // Elevated unemployment
    }

    // Food Security Risk Factors
    if (data.foodProductionIndex !== undefined && !isNaN(data.foodProductionIndex)) {
        factorCount++;
        if (data.foodProductionIndex < 80) riskScore += 20; // Severe food shortage
        else if (data.foodProductionIndex < 90) riskScore += 10; // Low production
        else if (data.foodProductionIndex < 95) riskScore += 5; // Below baseline
    }

    if (data.foodImports !== undefined && !isNaN(data.foodImports)) {
        factorCount++;
        if (data.foodImports > 25) riskScore += 10; // High dependency
        else if (data.foodImports > 15) riskScore += 5; // Moderate dependency
    }

    // Population pressure
    if (data.populationGrowth !== undefined && !isNaN(data.populationGrowth) && data.foodProductionIndex !== undefined) {
        factorCount++;
        if (data.populationGrowth > 2 && data.foodProductionIndex < 100) {
            riskScore += 15; // Population growing faster than food
        } else if (data.populationGrowth > 3) {
            riskScore += 5; // Rapid population growth
        }
    }

    // Normalize to 0-100 scale
    return factorCount > 0 ? Math.min(100, riskScore) : 50; // Default 50 if no data
}

export function calculateCountryRisks(dataRows: any[]): Record<string, number> {
    const latestYear = Math.max(...dataRows.map(d => d.year));
    const latestData = dataRows.filter(d => d.year === latestYear);

    const riskMap: Record<string, number> = {};

    latestData.forEach(row => {
        const risk = calculateRiskScore({
            gdpGrowth: row.gdpGrowth,
            inflation: row.inflation,
            unemployment: row.unemployment,
            foodProductionIndex: row.foodProductionIndex,
            foodImports: row.foodImports,
            populationGrowth: row.populationGrowth
        });

        riskMap[row.countryName] = risk;
    });

    return riskMap;
}
