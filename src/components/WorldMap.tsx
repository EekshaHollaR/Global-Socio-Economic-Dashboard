import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  onCountryClick?: (countryName: string) => void;
  highlightedCountries?: string[];
  countryRiskData?: Record<string, number>; // Country name -> Risk score (0-100)
}

const WorldMap = ({ onCountryClick, highlightedCountries = [], countryRiskData = {} }: WorldMapProps) => {
  const [tooltipContent, setTooltipContent] = useState<{ name: string; risk?: number } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCountryClick = (countryName: string) => {
    if (onCountryClick) {
      onCountryClick(countryName);
    }
    toast({
      title: `Selected: ${countryName}`,
      description: "Loading country data...",
    });
    navigate("/countries", { state: { selectedCountry: countryName } });
  };

  const getRiskColor = (risk: number): string => {
    if (risk >= 70) return "rgb(220, 38, 38)"; // Dark red - High risk
    if (risk >= 50) return "rgb(249, 115, 22)"; // Orange - Medium-high risk
    if (risk >= 30) return "rgb(234, 179, 8)"; // Yellow - Medium risk
    if (risk >= 10) return "rgb(132, 204, 22)"; // Light green - Low-medium risk
    return "rgb(34, 197, 94)"; // Green - Low risk
  };

  const getRiskLabel = (risk: number): string => {
    if (risk >= 70) return "High Risk";
    if (risk >= 50) return "Medium-High Risk";
    if (risk >= 30) return "Medium Risk";
    if (risk >= 10) return "Low-Medium Risk";
    return "Low Risk";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Global Crisis Risk Map</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on any country to view detailed information. Color indicates crisis risk level.
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(34, 197, 94)" }}></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(234, 179, 8)" }}></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(249, 115, 22)" }}></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(220, 38, 38)" }}></div>
            <span>Critical</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ height: "500px" }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
            }}
            width={800}
            height={400}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup center={[0, 20]} zoom={1} maxZoom={8}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    const riskScore = countryRiskData[countryName];
                    const hasRiskData = riskScore !== undefined;
                    const fillColor = hasRiskData ? getRiskColor(riskScore) : "hsl(var(--muted))";

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          setTooltipContent({
                            name: countryName,
                            risk: riskScore
                          });
                        }}
                        onMouseLeave={() => {
                          setTooltipContent(null);
                        }}
                        onClick={() => handleCountryClick(countryName)}
                        style={{
                          default: {
                            fill: fillColor,
                            stroke: "hsl(var(--border))",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: hasRiskData ? fillColor : "hsl(var(--accent))",
                            stroke: "hsl(var(--primary))",
                            strokeWidth: 1.5,
                            outline: "none",
                            cursor: "pointer",
                            filter: "brightness(1.1)",
                          },
                          pressed: {
                            fill: "hsl(var(--primary))",
                            stroke: "hsl(var(--primary))",
                            strokeWidth: 1,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          {tooltipContent && (
            <div className="absolute top-4 left-4 bg-card border border-border rounded-md px-4 py-3 shadow-lg z-10">
              <p className="text-sm font-bold">{tooltipContent.name}</p>
              {tooltipContent.risk !== undefined ? (
                <>
                  <p className="text-xs text-muted-foreground mt-1">
                    Risk Score: <span className="font-semibold">{tooltipContent.risk.toFixed(0)}/100</span>
                  </p>
                  <p className="text-xs font-medium mt-1" style={{
                    color: getRiskColor(tooltipContent.risk)
                  }}>
                    {getRiskLabel(tooltipContent.risk)}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">No data available</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMap;
