import { useState } from "react";
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
}

const WorldMap = ({ onCountryClick, highlightedCountries = [] }: WorldMapProps) => {
  const [tooltipContent, setTooltipContent] = useState("");
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
    // Navigate to countries page with the country name in URL state
    navigate("/countries", { state: { selectedCountry: countryName } });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive World Map</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on any country to view detailed information
        </p>
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
                    const isHighlighted = highlightedCountries.includes(countryName);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          setTooltipContent(countryName);
                        }}
                        onMouseLeave={() => {
                          setTooltipContent("");
                        }}
                        onClick={() => handleCountryClick(countryName)}
                        style={{
                          default: {
                            fill: isHighlighted ? "hsl(var(--primary))" : "hsl(var(--muted))",
                            stroke: "hsl(var(--border))",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: "hsl(var(--accent))",
                            stroke: "hsl(var(--primary))",
                            strokeWidth: 1,
                            outline: "none",
                            cursor: "pointer",
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
            <div className="absolute top-4 left-4 bg-card border border-border rounded-md px-3 py-2 shadow-lg z-10">
              <p className="text-sm font-medium">{tooltipContent}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMap;

