import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DataLoader } from "@/lib/dataLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import type { CountryData } from "@/types/data";

const Countries = () => {
  const location = useLocation();
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      const list = await DataLoader.getCountries();
      setCountries(list);
      
      // Check if a country was passed via navigation state
      const stateCountry = (location.state as { selectedCountry?: string })?.selectedCountry;
      
      if (stateCountry && list.includes(stateCountry)) {
        setSelectedCountry(stateCountry);
      } else if (list.length > 0) {
        setSelectedCountry(list[0]);
      }
      setLoading(false);
    };
    loadCountries();
  }, [location.state]);

  useEffect(() => {
    if (selectedCountry) {
      const loadCountryData = async () => {
        const data = await DataLoader.getCountryData(selectedCountry);
        setCountryData(data);
      };
      loadCountryData();
    }
  }, [selectedCountry]);

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLatestData = () => {
    if (!countryData || !countryData.latestData) return null;
    return countryData.latestData;
  };

  const latestData = getLatestData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <section>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Country Profiles
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore detailed socio-economic indicators by country
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Country</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {filteredCountries.length} countries available
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {latestData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{selectedCountry}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Latest Data: {latestData.year}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">GDP Growth</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold">
                            {latestData.gdpGrowth?.toFixed(2)}%
                          </p>
                          {latestData.gdpGrowth && latestData.gdpGrowth > 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">GDP per Capita</p>
                        <p className="text-2xl font-bold">
                          ${latestData.gdpPerCapita?.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Food Production Index</p>
                        <p className="text-2xl font-bold">
                          {latestData.foodProductionIndex?.toFixed(1)}
                        </p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Inflation Rate</p>
                        <p className="text-2xl font-bold">
                          {latestData.inflation?.toFixed(2)}%
                        </p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Cereal Yield</p>
                        <p className="text-2xl font-bold">
                          {latestData.cerealYield?.toLocaleString()} kg/ha
                        </p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Population Growth</p>
                        <p className="text-2xl font-bold">
                          {latestData.populationGrowth?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Historical Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mt-2">
                      Total records: {countryData?.historicalFood.length} data points available
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {loading ? "Loading..." : "Select a country to view data"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countries;
