'use client';

import { useState } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataLoader } from '@/lib/dataLoader';
import { useToast } from '@/hooks/use-toast';
import { analyzeEconomicCrisis, analyzeFoodCrisis, type CrisisResult } from '@/lib/crisisAnalysis';

const CrisisAnalyzer = () => {
  const [crisisType, setCrisisType] = useState<'economic' | 'food'>('economic');
  const [forecastYear, setForecastYear] = useState('2025');
  const [results, setResults] = useState<CrisisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const countries = await DataLoader.getCountries();
      const crisisResults: CrisisResult[] = [];

      // Process countries sequentially or in batches
      for (const country of countries) {
        const countryData = await DataLoader.getCountryData(country);
        if (!countryData) continue;

        let result: CrisisResult;

        try {
          if (crisisType === 'economic') {
            // ✅ Calls Python model through backend API
            result = await analyzeEconomicCrisis(country, {
              gdpGrowth: countryData.latestData.gdpGrowth || 0,
              inflation: countryData.latestData.inflation || 0,
              unemployment: countryData.latestData.unemployment || 0,
              domesticCredit: countryData.latestData.domesticCredit || 0,
              exports: countryData.latestData.exports || 0,
              imports: countryData.latestData.imports || 0,
            });
          } else {
            // ✅ Calls Python model through backend API
            result = await analyzeFoodCrisis(country, {
              cerealYield: countryData.latestData.cerealYield || 0,
              foodImports: countryData.latestData.foodImports || 0,
              foodProductionIndex: countryData.latestData.foodProductionIndex || 0,
              gdpGrowth: countryData.latestData.gdpGrowth || 0,
              gdpPerCapita: countryData.latestData.gdpPerCapita || 0,
              inflation: countryData.latestData.inflation || 0,
              populationGrowth: countryData.latestData.populationGrowth || 0,
            });
          }

          if (result.probability > 50) {
            crisisResults.push(result);
          }
        } catch (error) {
          console.error(`Error analyzing ${country}:`, error);
          // Continue with next country on error
        }
      }

      setResults(
        crisisResults.sort((a, b) => b.probability - a.probability)
      );

      toast({
        title: 'Analysis Complete',
        description: `Found ${crisisResults.length} countries at high risk`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to complete crisis analysis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const highRiskCountries = results.filter((r) => r.probability > 50);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Hero Section */}
        <section className="space-y-6 text-center">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Global Crisis Risk Analyzer
            </h1>
            <p className="text-lg text-muted-foreground">
              Using AI-driven indicators to detect early signs of socioeconomic instability.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            <Tabs
              value={crisisType}
              onValueChange={(v) => setCrisisType(v as 'economic' | 'food')}
            >
              <TabsList>
                <TabsTrigger value="economic">Economic Crisis</TabsTrigger>
                <TabsTrigger value="food">Food Crisis</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={forecastYear} onValueChange={setForecastYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">Forecast Year: 2025</SelectItem>
                <SelectItem value="2026">Forecast Year: 2026</SelectItem>
                <SelectItem value="2027">Forecast Year: 2027</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={runAnalysis}
              disabled={loading}
              size="lg"
              className="px-8"
            >
              {loading ? 'Analyzing...' : 'Run Crisis Prediction Analysis'}
            </Button>
          </div>
        </section>

        {/* Results Section */}
        {results.length > 0 && (
          <>
            {/* High-Risk Alert */}
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-destructive mb-2">
                      High-Risk Alert for {forecastYear}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      The following countries show a significant crisis probability (
                      &gt;50%) and require close monitoring.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {highRiskCountries.slice(0, 10).map((result) => (
                        <span
                          key={result.country}
                          className="px-3 py-1 bg-destructive/20 text-destructive-foreground rounded-full text-sm font-medium"
                        >
                          {result.country}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Prediction of{' '}
                {crisisType === 'economic' ? 'Economic' : 'Food'} Crisis for{' '}
                {forecastYear}
              </h2>
              <p className="text-muted-foreground mb-6">
                Filtered Report: Countries with &gt;50% Probability
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <Card key={result.country} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h3 className="text-xl font-bold">{result.country}</h3>
                      </div>

                      <div className="text-center mb-6">
                        <p className="text-sm text-muted-foreground mb-2">
                          Crisis Probability
                        </p>
                        <p className="text-5xl font-bold text-destructive">
                          {result.probability.toFixed(2)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-3">
                          Top 3 Contributing Indicators
                        </p>
                        <div className="space-y-3">
                          {result.topIndicators.map((indicator, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">
                                  {idx + 1}. {indicator.name}
                                </span>
                                <span className="text-destructive">
                                  +{indicator.impact.toFixed(3)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Value:</span>
                                <span className="text-foreground">
                                  {indicator.value.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Click "Run Crisis Prediction Analysis" to analyze global risk
                indicators
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CrisisAnalyzer;