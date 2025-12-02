import { AlertTriangle, TrendingDown, AlertCircle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { FoodDataRow } from "@/types/data";
import type { CrisisResult } from "@/lib/crisisAnalysis";

interface Alert {
  id: string;
  country: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  value?: number;
  source: "model" | "static";
}

interface AlertsSectionProps {
  foodData: FoodDataRow[];
}

const AlertsSection = ({ foodData }: AlertsSectionProps) => {
  const getModelAlerts = (): Alert[] => {
    try {
      const savedResults = sessionStorage.getItem('crisisAnalysisResults');
      if (!savedResults) return [];

      const results: CrisisResult[] = JSON.parse(savedResults);
      const highRisk = results.filter(r => r.probability > 50);

      return highRisk.map(r => ({
        id: `model-${r.country}`,
        country: r.country,
        type: r.probability > 80 ? "danger" : "warning",
        title: r.probability > 80 ? "Critical Crisis Risk" : "High Crisis Risk",
        description: `Model predicts ${r.probability.toFixed(1)}% probability of ${r.classification.toLowerCase()}.`,
        value: r.probability,
        source: "model"
      }));
    } catch (e) {
      console.error("Failed to load model alerts", e);
      return [];
    }
  };

  const generateStaticAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const latestYear = Math.max(...foodData.map((d) => d.year));
    const latestData = foodData.filter((d) => d.year === latestYear);

    // Check for negative GDP growth
    latestData.forEach((row) => {
      if (row.gdpGrowth !== undefined && row.gdpGrowth < -2) {
        alerts.push({
          id: `gdp-${row.countryCode}`,
          country: row.countryName,
          type: "danger",
          title: "Severe Economic Decline",
          description: `GDP growth is ${row.gdpGrowth.toFixed(2)}%, indicating economic recession`,
          value: row.gdpGrowth,
          source: "static"
        });
      } else if (row.gdpGrowth !== undefined && row.gdpGrowth < 0) {
        alerts.push({
          id: `gdp-${row.countryCode}`,
          country: row.countryName,
          type: "warning",
          title: "Negative GDP Growth",
          description: `GDP growth is ${row.gdpGrowth.toFixed(2)}%`,
          value: row.gdpGrowth,
          source: "static"
        });
      }
    });

    // Check for low food production
    latestData.forEach((row) => {
      if (row.foodProductionIndex !== undefined && row.foodProductionIndex < 90) {
        alerts.push({
          id: `food-${row.countryCode}`,
          country: row.countryName,
          type: "danger",
          title: "Low Food Production",
          description: `Food production index at ${row.foodProductionIndex.toFixed(1)}, below baseline`,
          value: row.foodProductionIndex,
          source: "static"
        });
      }
    });

    // Check for high inflation
    latestData.forEach((row) => {
      if (row.inflation !== undefined && row.inflation > 10) {
        alerts.push({
          id: `inflation-${row.countryCode}`,
          country: row.countryName,
          type: "warning",
          title: "High Inflation",
          description: `Inflation rate at ${row.inflation.toFixed(2)}%`,
          value: row.inflation,
          source: "static"
        });
      }
    });

    return alerts;
  };

  const modelAlerts = getModelAlerts();
  // If we have model alerts, use them. Otherwise fallback to static alerts.
  const alerts = modelAlerts.length > 0 ? modelAlerts : generateStaticAlerts();

  // Sort by priority
  const sortedAlerts = alerts.sort((a, b) => {
    const priority = { danger: 0, warning: 1, info: 2 };
    return priority[a.type] - priority[b.type];
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <TrendingDown className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "danger":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge className="bg-orange-500">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Alerts & Warnings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {modelAlerts.length > 0
                ? "Based on latest AI Model Predictions"
                : "Based on static historical data thresholds"}
            </p>
          </div>
          {modelAlerts.length === 0 && (
            <Link to="/crisis-analyzer">
              <Button size="sm" variant="outline" className="gap-2">
                <Zap className="h-4 w-4" />
                Run AI Analysis
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                No significant risks detected in the current data.
              </p>
              <Link to="/crisis-analyzer">
                <Button variant="secondary">Run New Analysis</Button>
              </Link>
            </div>
          ) : (
            sortedAlerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.country}</p>
                    </div>
                    {getAlertBadge(alert.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsSection;
