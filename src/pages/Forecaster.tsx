import { useEffect, useState } from "react";
import { DataLoader } from "@/lib/dataLoader";
import { forecastIndicator, calculateGrowthRate, ForecastPoint } from "@/lib/forecasting";
import CountryFilter from "@/components/CountryFilter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity, DollarSign, Wheat } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { FoodDataRow } from "@/types/data";

const Forecaster = () => {
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState<FoodDataRow[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const food = await DataLoader.loadFoodData();
        setFoodData(food);
      } catch (error) {
        console.error("Error loading forecast data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get unique countries from foodData
  const uniqueCountries = Array.from(new Set(foodData.map((row) => row.countryName))).sort();

  // Forecast global GDP growth
  const forecastGDPGrowth = (): ForecastPoint[] => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const yearlyData = new Map<number, number[]>();
    
    filteredData.forEach((row) => {
      if (row.gdpGrowth !== undefined && !isNaN(row.gdpGrowth)) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.gdpGrowth);
      }
    });

    const historicalData = Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);

    return forecastIndicator(historicalData, 5);
  };

  // Forecast food production
  const forecastFoodProduction = (): ForecastPoint[] => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const yearlyData = new Map<number, number[]>();
    
    filteredData.forEach((row) => {
      if (row.foodProductionIndex !== undefined && !isNaN(row.foodProductionIndex)) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.foodProductionIndex);
      }
    });

    const historicalData = Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);

    return forecastIndicator(historicalData, 5);
  };

  // Forecast GDP per capita
  const forecastGDPPerCapita = (): ForecastPoint[] => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const yearlyData = new Map<number, number[]>();
    
    filteredData.forEach((row) => {
      if (row.gdpPerCapita !== undefined && !isNaN(row.gdpPerCapita)) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.gdpPerCapita);
      }
    });

    const historicalData = Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);

    return forecastIndicator(historicalData, 5);
  };

  // Forecast inflation
  const forecastInflation = (): ForecastPoint[] => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const yearlyData = new Map<number, number[]>();
    
    filteredData.forEach((row) => {
      if (row.inflation !== undefined && !isNaN(row.inflation) && Math.abs(row.inflation) < 100) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.inflation);
      }
    });

    const historicalData = Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);

    return forecastIndicator(historicalData, 5);
  };

  const gdpGrowthForecast = forecastGDPGrowth();
  const foodProductionForecast = forecastFoodProduction();
  const gdpPerCapitaForecast = forecastGDPPerCapita();
  const inflationForecast = forecastInflation();

  const lastHistoricalYear = gdpGrowthForecast.find((d) => d.isHistorical)
    ? Math.max(...gdpGrowthForecast.filter((d) => d.isHistorical).map((d) => d.year))
    : 2023;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Generating forecasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <section className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                5-Year Economic Forecaster
              </h1>
              <p className="text-lg text-muted-foreground">
                Predictive analysis of key socio-economic indicators
              </p>
            </div>
          </div>
        </section>

        {/* Info Banner */}
        <Card className="bg-accent/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Methodology:</strong> Forecasts are generated using linear regression analysis based on historical trends from 2010 onwards. 
              Dotted lines indicate projected values. These are statistical projections and should be used for informational purposes only.
            </p>
          </CardContent>
        </Card>

        {/* Forecast Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                GDP Growth Rate Forecast
              </CardTitle>
              <CardDescription>Projected average global GDP growth (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gdpGrowthForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={lastHistoricalYear} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="GDP Growth (%)"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                Food Production Index Forecast
              </CardTitle>
              <CardDescription>Projected global food production trends</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={foodProductionForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={lastHistoricalYear} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Production Index"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                GDP per Capita Forecast
              </CardTitle>
              <CardDescription>Projected average GDP per capita (USD)</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gdpPerCapitaForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={lastHistoricalYear} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="GDP per Capita"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Inflation Rate Forecast
              </CardTitle>
              <CardDescription>Projected average inflation trends (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={inflationForecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={lastHistoricalYear} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Inflation (%)"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forecaster;
