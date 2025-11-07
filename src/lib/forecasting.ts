import regression from "regression";

export interface ForecastPoint {
  year: number;
  value: number;
  isHistorical: boolean;
}

export const forecastIndicator = (
  historicalData: { year: number; value: number }[],
  yearsToForecast: number = 5
): ForecastPoint[] => {
  if (historicalData.length < 3) {
    return [];
  }

  // Sort data by year
  const sortedData = [...historicalData].sort((a, b) => a.year - b.year);
  
  // Prepare data for regression (convert to [x, y] format)
  const regressionData: [number, number][] = sortedData.map((d) => [d.year, d.value]);

  // Use linear regression for simplicity
  const result = regression.linear(regressionData);

  // Get the last historical year
  const lastYear = sortedData[sortedData.length - 1].year;

  // Create forecast points
  const forecast: ForecastPoint[] = [];

  // Add historical data
  sortedData.forEach((d) => {
    forecast.push({
      year: d.year,
      value: d.value,
      isHistorical: true,
    });
  });

  // Add forecasted data
  for (let i = 1; i <= yearsToForecast; i++) {
    const year = lastYear + i;
    const value = result.predict(year)[1];
    forecast.push({
      year,
      value,
      isHistorical: false,
    });
  }

  return forecast;
};

export const calculateGrowthRate = (data: { year: number; value: number }[]): number => {
  if (data.length < 2) return 0;

  const sorted = [...data].sort((a, b) => a.year - b.year);
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const years = sorted[sorted.length - 1].year - sorted[0].year;

  if (first === 0 || years === 0) return 0;

  // Calculate compound annual growth rate (CAGR)
  const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;
  return cagr;
};
