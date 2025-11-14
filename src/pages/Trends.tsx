import { useEffect, useState } from "react";
import { DataLoader } from "@/lib/dataLoader";
import CountryFilter from "@/components/CountryFilter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FoodDataRow } from "@/types/data";

const Trends = () => {
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState<FoodDataRow[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const food = await DataLoader.loadFoodData();
        setFoodData(food);
      } catch (error) {
        console.error("Error loading trends data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get unique countries from foodData
  const uniqueCountries = Array.from(new Set(foodData.map((row) => row.countryName))).sort();

  // Compare GDP growth vs Food production
  const getGDPFoodCorrelation = () => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    return filteredData
      .filter(
        (row) =>
          row.year >= 2015 &&
          row.gdpGrowth !== undefined &&
          row.foodProductionIndex !== undefined
      )
      .map((row) => ({
        gdpGrowth: row.gdpGrowth!,
        foodProduction: row.foodProductionIndex!,
        country: row.countryName,
        year: row.year,
      }));
  };

  // Multi-country GDP comparison
  const getTopCountriesGDP = () => {
    const topCountries = ["United States", "China", "Japan", "Germany", "India", "United Kingdom"];
    const yearlyData = new Map<number, Map<string, number>>();

    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    filteredData
      .filter((row) => {
        if (selectedCountry) {
          return row.countryName === selectedCountry && row.gdpGrowth !== undefined;
        }
        return topCountries.includes(row.countryName) && row.gdpGrowth !== undefined;
      })
      .forEach((row) => {
        if (!yearlyData.has(row.year)) {
          yearlyData.set(row.year, new Map());
        }
        yearlyData.get(row.year)!.set(row.countryName, row.gdpGrowth!);
      });

    return Array.from(yearlyData.entries())
      .map(([year, countries]) => {
        const data: any = { year };
        countries.forEach((value, country) => {
          data[country] = value;
        });
        return data;
      })
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);
  };

  // Food production trends across regions
  const getRegionalFoodTrends = () => {
    const regions = ["United States", "China", "India", "Brazil", "France"];
    const yearlyData = new Map<number, Map<string, number>>();

    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    filteredData
      .filter((row) => {
        if (selectedCountry) {
          return row.countryName === selectedCountry && row.foodProductionIndex !== undefined;
        }
        return regions.includes(row.countryName) && row.foodProductionIndex !== undefined;
      })
      .forEach((row) => {
        if (!yearlyData.has(row.year)) {
          yearlyData.set(row.year, new Map());
        }
        yearlyData.get(row.year)!.set(row.countryName, row.foodProductionIndex!);
      });

    return Array.from(yearlyData.entries())
      .map(([year, countries]) => {
        const data: any = { year };
        countries.forEach((value, country) => {
          data[country] = value;
        });
        return data;
      })
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);
  };

  // Inflation vs GDP growth
  const getInflationGDPRelation = () => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    return filteredData
      .filter(
        (row) =>
          row.year === 2023 &&
          row.inflation !== undefined &&
          row.gdpGrowth !== undefined &&
          Math.abs(row.inflation!) < 50
      )
      .map((row) => ({
        inflation: row.inflation!,
        gdpGrowth: row.gdpGrowth!,
        country: row.countryName,
      }));
  };

  const correlationData = getGDPFoodCorrelation();
  const topCountriesGDP = getTopCountriesGDP();
  const regionalFood = getRegionalFoodTrends();
  const inflationGDP = getInflationGDPRelation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading trends analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Global Trends Analysis
              </h1>
              <p className="text-lg text-muted-foreground">
                Long-term patterns and comparative insights
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>GDP Growth Comparison (Major Economies)</CardTitle>
              <CardDescription>Multi-country GDP growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={topCountriesGDP}>
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
                  <Line type="monotone" dataKey="United States" stroke="hsl(var(--chart-1))" />
                  <Line type="monotone" dataKey="China" stroke="hsl(var(--chart-2))" />
                  <Line type="monotone" dataKey="Japan" stroke="hsl(var(--chart-3))" />
                  <Line type="monotone" dataKey="Germany" stroke="hsl(var(--chart-4))" />
                  <Line type="monotone" dataKey="India" stroke="hsl(var(--chart-5))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Food Production by Country</CardTitle>
              <CardDescription>Regional food production trends</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={regionalFood}>
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
                  <Line type="monotone" dataKey="United States" stroke="hsl(var(--chart-1))" />
                  <Line type="monotone" dataKey="China" stroke="hsl(var(--chart-2))" />
                  <Line type="monotone" dataKey="India" stroke="hsl(var(--chart-3))" />
                  <Line type="monotone" dataKey="Brazil" stroke="hsl(var(--chart-4))" />
                  <Line type="monotone" dataKey="France" stroke="hsl(var(--chart-5))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GDP Growth vs Food Production</CardTitle>
              <CardDescription>Correlation analysis (2015-present)</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    dataKey="gdpGrowth"
                    name="GDP Growth"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "GDP Growth (%)", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="foodProduction"
                    name="Food Production"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Food Production Index", angle: -90, position: "left" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Scatter data={correlationData} fill="hsl(var(--chart-2))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inflation vs GDP Growth (2023)</CardTitle>
              <CardDescription>Relationship between inflation and economic growth</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    dataKey="inflation"
                    name="Inflation"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Inflation Rate (%)", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="gdpGrowth"
                    name="GDP Growth"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "GDP Growth (%)", angle: -90, position: "left" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Scatter data={inflationGDP} fill="hsl(var(--chart-3))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Trends;
