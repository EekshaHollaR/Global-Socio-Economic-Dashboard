import { useEffect, useState } from "react";
import { DataLoader } from "@/lib/dataLoader";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import WorldMap from "@/components/WorldMap";
import AlertsSection from "@/components/AlertsSection";
import { Globe, TrendingUp, Database, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
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

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [foodData, setFoodData] = useState<FoodDataRow[]>([]);
  const [yearRange, setYearRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesList, food, years] = await Promise.all([
          DataLoader.getCountries(),
          DataLoader.loadFoodData(),
          DataLoader.getYearRange(),
        ]);
        setCountries(countriesList);
        setFoodData(food);
        setYearRange(years);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate global trends
  const getGlobalTrends = () => {
    if (foodData.length === 0) return [];

    const yearlyData = new Map<number, { gdp: number[]; growth: number[]; production: number[] }>();

    foodData.forEach((row) => {
      if (!yearlyData.has(row.year)) {
        yearlyData.set(row.year, { gdp: [], growth: [], production: [] });
      }
      const data = yearlyData.get(row.year)!;
      if (row.gdpGrowth !== undefined && !isNaN(row.gdpGrowth)) data.growth.push(row.gdpGrowth);
      if (row.foodProductionIndex !== undefined && !isNaN(row.foodProductionIndex))
        data.production.push(row.foodProductionIndex);
    });

    return Array.from(yearlyData.entries())
      .map(([year, data]) => ({
        year,
        avgGrowth: data.growth.length > 0
          ? data.growth.reduce((a, b) => a + b, 0) / data.growth.length
          : 0,
        avgProduction: data.production.length > 0
          ? data.production.reduce((a, b) => a + b, 0) / data.production.length
          : 0,
      }))
      .filter((d) => d.year >= 2015)
      .sort((a, b) => a.year - b.year);
  };

  const globalTrends = getGlobalTrends();

  // Recent data sample
  const recentData = foodData
    .filter((row) => row.year === 2023)
    .slice(0, 10)
    .map((row) => ({
      country: row.countryName,
      year: row.year,
      gdpGrowth: row.gdpGrowth?.toFixed(2) || "—",
      gdpPerCapita: row.gdpPerCapita ? `$${(row.gdpPerCapita).toLocaleString()}` : "—",
      foodProduction: row.foodProductionIndex?.toFixed(1) || "—",
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Database className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading global data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Global Socio-Economic Crisis Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive analysis of food security and economic indicators
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Countries Tracked"
            value={countries.length}
            description="Global coverage"
            icon={Globe}
          />
          <StatsCard
            title="Total Records"
            value={foodData.length.toLocaleString()}
            description="Data points collected"
            icon={Database}
          />
          <StatsCard
            title="Year Range"
            value={`${yearRange.min}-${yearRange.max}`}
            description="Historical data span"
            icon={Calendar}
          />
          <StatsCard
            title="Indicators"
            value="18+"
            description="Economic & food metrics"
            icon={TrendingUp}
          />
        </section>

        {/* World Map Section */}
        <section>
          <WorldMap highlightedCountries={countries.slice(0, 20)} />
        </section>

        {/* Alerts Section */}
        <section>
          <AlertsSection foodData={foodData} />
        </section>

        {/* Charts Section */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Global GDP Growth Trends</CardTitle>
              <CardDescription>Average annual growth rate by year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={globalTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="year"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
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
                    name="Avg Growth (%)"
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
              <CardTitle>Food Production Index</CardTitle>
              <CardDescription>Global average (2014-2016 = 100)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={globalTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="year"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="avgProduction"
                    name="Production Index"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Recent Data Table */}
        <DataTable
          title="Recent Country Data (2023)"
          columns={[
            { key: "country", label: "Country" },
            { key: "year", label: "Year" },
            { key: "gdpGrowth", label: "GDP Growth (%)" },
            { key: "gdpPerCapita", label: "GDP per Capita" },
            { key: "foodProduction", label: "Food Production Index" },
          ]}
          data={recentData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
