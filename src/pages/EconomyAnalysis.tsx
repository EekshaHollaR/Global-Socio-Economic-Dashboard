import { useEffect, useState } from "react";
import { DataLoader } from "@/lib/dataLoader";
import CountryFilter from "@/components/CountryFilter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, Globe } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FoodDataRow } from "@/types/data";

const EconomyAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState<FoodDataRow[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const food = await DataLoader.loadFoodData();
        setFoodData(food);
      } catch (error) {
        console.error("Error loading economy data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get unique countries from foodData
  const uniqueCountries = Array.from(new Set(foodData.map((row) => row.countryName))).sort();

  // GDP Growth trends
  const getGDPGrowthTrends = () => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const yearlyData = new Map<number, { positive: number[]; negative: number[] }>();
    
    filteredData.forEach((row) => {
      if (row.gdpGrowth !== undefined && !isNaN(row.gdpGrowth)) {
        if (!yearlyData.has(row.year)) {
          yearlyData.set(row.year, { positive: [], negative: [] });
        }
        const data = yearlyData.get(row.year)!;
        if (row.gdpGrowth >= 0) {
          data.positive.push(row.gdpGrowth);
        } else {
          data.negative.push(row.gdpGrowth);
        }
      }
    });

    return Array.from(yearlyData.entries())
      .map(([year, data]) => ({
        year,
        avgPositive: data.positive.length > 0
          ? data.positive.reduce((a, b) => a + b, 0) / data.positive.length
          : 0,
        avgNegative: data.negative.length > 0
          ? data.negative.reduce((a, b) => a + b, 0) / data.negative.length
          : 0,
        countriesGrowing: data.positive.length,
        countriesContracting: data.negative.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);
  };

  // GDP per capita distribution
  const getGDPPerCapitaDistribution = () => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const latestYear = Math.max(...filteredData.map((d) => d.year));
    const ranges = [
      { label: "< $5k", min: 0, max: 5000, count: 0 },
      { label: "$5k-$15k", min: 5000, max: 15000, count: 0 },
      { label: "$15k-$30k", min: 15000, max: 30000, count: 0 },
      { label: "$30k-$50k", min: 30000, max: 50000, count: 0 },
      { label: "> $50k", min: 50000, max: Infinity, count: 0 },
    ];

    filteredData
      .filter((row) => row.year === latestYear && row.gdpPerCapita !== undefined)
      .forEach((row) => {
        const gdp = row.gdpPerCapita!;
        const range = ranges.find((r) => gdp >= r.min && gdp < r.max);
        if (range) range.count++;
      });

    return ranges;
  };

  // Inflation trends
  const getInflationTrends = () => {
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

    return Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        avgInflation: values.reduce((a, b) => a + b, 0) / values.length,
        medianInflation: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);
  };

  // Population growth
  const getPopulationGrowth = () => {
    const filteredData = selectedCountry
      ? foodData.filter((row) => row.countryName === selectedCountry)
      : foodData;

    const yearlyData = new Map<number, number[]>();
    
    filteredData.forEach((row) => {
      if (row.populationGrowth !== undefined && !isNaN(row.populationGrowth)) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.populationGrowth);
      }
    });

    return Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        avgGrowth: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);
  };

  const gdpGrowthTrends = getGDPGrowthTrends();
  const gdpPerCapitaDist = getGDPPerCapitaDistribution();
  const inflationTrends = getInflationTrends();
  const populationGrowth = getPopulationGrowth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading economic analysis...</p>
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
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Economic Indicators Analysis
              </h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive economic growth and development metrics
              </p>
            </div>
          </div>
        </section>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>GDP Growth Distribution</CardTitle>
              <CardDescription>Countries with positive vs negative growth</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gdpGrowthTrends}>
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
                  <Bar
                    dataKey="countriesGrowing"
                    name="Growing"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="countriesContracting"
                    name="Contracting"
                    fill="hsl(var(--destructive))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GDP per Capita Distribution</CardTitle>
              <CardDescription>Number of countries by income level</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gdpPerCapitaDist}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Countries"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Inflation Trends</CardTitle>
              <CardDescription>Average and median inflation rates</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={inflationTrends}>
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
                  <Area
                    type="monotone"
                    dataKey="avgInflation"
                    name="Avg Inflation"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="medianInflation"
                    name="Median"
                    stroke="hsl(var(--chart-4))"
                    fill="hsl(var(--chart-4))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Population Growth Rate</CardTitle>
              <CardDescription>Average global population growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <CountryFilter
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onChange={setSelectedCountry}
              />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={populationGrowth}>
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
                  <Line
                    type="monotone"
                    dataKey="avgGrowth"
                    name="Population Growth (%)"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
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

export default EconomyAnalysis;
