import { AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FoodDataRow } from "@/types/data";

interface Alert {
  id: string;
  country: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  value?: number;
}

interface AlertsSectionProps {
  foodData: FoodDataRow[];
}

const AlertsSection = ({ foodData }: AlertsSectionProps) => {
  const generateAlerts = (): Alert[] => {
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
        });
      } else if (row.gdpGrowth !== undefined && row.gdpGrowth < 0) {
        alerts.push({
          id: `gdp-${row.countryCode}`,
          country: row.countryName,
          type: "warning",
          title: "Negative GDP Growth",
          description: `GDP growth is ${row.gdpGrowth.toFixed(2)}%`,
          value: row.gdpGrowth,
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
        });
      }
    });

    return alerts.sort((a, b) => {
      const priority = { danger: 0, warning: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  };

  const alerts = generateAlerts();

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
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Alerts & Warnings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {alerts.length} active alerts detected based on latest data
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No significant risks detected in the current data.
            </p>
          ) : (
            alerts.slice(0, 10).map((alert) => (
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
