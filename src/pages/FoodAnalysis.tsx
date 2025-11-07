import { useEffect, useState } from "react";
import { DataLoader } from "@/lib/dataLoader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wheat, TrendingUp, MapPin } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FoodDataRow } from "@/types/data";

const FoodAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState<FoodDataRow[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const food = await DataLoader.loadFoodData();
        setFoodData(food);
      } catch (error) {
        console.error("Error loading food data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Food production trends
  const getProductionTrends = () => {
    const yearlyData = new Map<number, number[]>();
    foodData.forEach((row) => {
      if (row.foodProductionIndex !== undefined && !isNaN(row.foodProductionIndex)) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.foodProductionIndex);
      }
    });

    return Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        avgProduction: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .sort((a, b) => a.year - b.year);
  };

  // Cereal yield analysis
  const getCerealYieldData = () => {
    const yearlyData = new Map<number, number[]>();
    foodData.forEach((row) => {
      if (row.cerealYield !== undefined && !isNaN(row.cerealYield)) {
        if (!yearlyData.has(row.year)) yearlyData.set(row.year, []);
        yearlyData.get(row.year)!.push(row.cerealYield);
      }
    });

    return Array.from(yearlyData.entries())
      .map(([year, values]) => ({
        year,
        avgYield: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .filter((d) => d.year >= 2010)
      .sort((a, b) => a.year - b.year);
  };

  // Food imports by region (sample top countries)
  const getFoodImportsData = () => {
    const latestYear = Math.max(...foodData.map((d) => d.year));
    return foodData
      .filter((row) => row.year === latestYear && row.foodImports !== undefined)
      .sort((a, b) => (b.foodImports || 0) - (a.foodImports || 0))
      .slice(0, 15)
      .map((row) => ({
        country: row.countryName,
        imports: row.foodImports || 0,
      }));
  };

  // Production vs GDP correlation
  const getCorrelationData = () => {
    return foodData
      .filter(
        (row) =>
          row.year === 2023 &&
          row.foodProductionIndex !== undefined &&
          row.gdpPerCapita !== undefined &&
          row.gdpPerCapita > 0
      )
      .map((row) => ({
        production: row.foodProductionIndex!,
        gdpPerCapita: row.gdpPerCapita!,
        country: row.countryName,
      }));
  };

  const productionTrends = getProductionTrends();
  const cerealYield = getCerealYieldData();
  const foodImports = getFoodImportsData();
  const correlationData = getCorrelationData();

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Wheat className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading food analysis...</p>
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
              <Wheat className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Food Security Analysis
              </h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive food production and security indicators
              </p>
            </div>
          </div>
        </section>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Global Food Production Index</CardTitle>
              <CardDescription>Average production trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productionTrends}>
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
                    dataKey="avgProduction"
                    name="Production Index"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cereal Yield Trends</CardTitle>
              <CardDescription>Average cereal yield (kg per hectare)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cerealYield}>
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
                    dataKey="avgYield"
                    name="Cereal Yield"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Food Importing Countries</CardTitle>
              <CardDescription>Latest year data (% of merchandise imports)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={foodImports} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    type="category"
                    dataKey="country"
                    width={100}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Bar dataKey="imports" name="Food Imports (%)">
                    {foodImports.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Food Production vs GDP</CardTitle>
              <CardDescription>Correlation between production and GDP per capita</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    dataKey="gdpPerCapita"
                    name="GDP per Capita"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "GDP per Capita", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="production"
                    name="Production"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Production Index", angle: -90, position: "left" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter data={correlationData} fill="hsl(var(--chart-1))" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis;
