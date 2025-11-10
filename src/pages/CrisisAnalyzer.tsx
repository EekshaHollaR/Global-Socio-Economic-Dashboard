'use client';

import { useState } from 'react';
import { Globe, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
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
import { 
  analyzeEconomicCrisis, 
  analyzeFoodCrisis, 
  type CrisisResult,
  type EconomicInput,
  type FoodInput 
} from '@/lib/crisisAnalysis';

const CrisisAnalyzer = () => {
  const [crisisType, setCrisisType] = useState<'economic' | 'food'>('economic');
  const [forecastYear, setForecastYear] = useState('2025');
  const [results, setResults] = useState<CrisisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    setProgress({ current: 0, total: 0 });
    try {
      const countries = await DataLoader.getCountries();
      setProgress({ current: 0, total: countries.length });

      const crisisResults: CrisisResult[] = [];

      // Process countries sequentially
      for (let i = 0; i < countries.length; i++) {
        const country = countries[i];
        setProgress({ current: i + 1, total: countries.length });

        const countryData = await DataLoader.getCountryData(country);
        if (!countryData) {
          console.log(`⏭️ Skipping ${country} - no data available`);
          continue;
        }

        let result: CrisisResult;

        try {
          if (crisisType === 'economic') {
            // ✅ UPDATED: Added NEW required parameters for pickle model
            // Economic model needs: gdpGrowth, inflation, unemployment, domesticCredit, 
            //                       exports, imports, gdpPerCapita, grossFixedCapital
            const economicInput: EconomicInput = {
              gdpGrowth: countryData.latestData.gdpGrowth ?? 0,
              inflation: countryData.latestData.inflation ?? 0,
              unemployment: countryData.latestData.unemployment ?? 0,
              domesticCredit: countryData.latestData.domesticCredit ?? 0,
              exports: countryData.latestData.exports ?? 0,
              imports: countryData.latestData.imports ?? 0,
              gdpPerCapita: countryData.latestData.gdpPerCapita ?? 0,              // NEW - Required
              grossFixedCapital: countryData.latestData.grossFixedCapital ?? 0,   // NEW - Required
            };

            result = await analyzeEconomicCrisis(country, economicInput);
            
          } else {
            // ✅ UPDATED: Added NEW required parameter gdpCurrent for pickle model
            // Food model needs: cerealYield, foodImports, foodProductionIndex,
            //                   gdpGrowth, gdpPerCapita, inflation, populationGrowth, gdpCurrent
            const foodInput: FoodInput = {
              cerealYield: countryData.latestData.cerealYield ?? 0,
              foodImports: countryData.latestData.foodImports ?? 0,
              foodProductionIndex: countryData.latestData.foodProductionIndex ?? 0,
              gdpGrowth: countryData.latestData.gdpGrowth ?? 0,
              gdpPerCapita: countryData.latestData.gdpPerCapita ?? 0,
              inflation: countryData.latestData.inflation ?? 0,
              populationGrowth: countryData.latestData.populationGrowth ?? 0,
              gdpCurrent: countryData.latestData.gdp ?? 1e10,  // NEW - Required (total GDP in US$)
            };

            result = await analyzeFoodCrisis(country, foodInput);
          }

          // Only include results with >50% probability
          if (result.probability > 50) {
            crisisResults.push(result);
            console.log(`✅ ${country}: ${result.probability.toFixed(1)}% - ${result.classification}`);
          } else {
            console.log(`ℹ️ ${country}: ${result.probability.toFixed(1)}% - ${result.classification}`);
          }

        } catch (error) {
          console.error(`❌ Error analyzing ${country}:`, error);
          // Continue with next country on error
        }
      }

      // Sort by probability (highest first)
      setResults(
        crisisResults.sort((a, b) => b.probability - a.probability)
      );

      // Show success toast
      toast({
        title: 'Analysis Complete',
        description: `Found ${crisisResults.length} countries at high risk (>50% probability)`,
      });

      console.log(`\n📊 Analysis Summary:`);
      console.log(`   Total Countries: ${countries.length}`);
      console.log(`   High-Risk Countries (>50%): ${crisisResults.length}`);
      console.log(`   Crisis Type: ${crisisType === 'economic' ? 'Economic' : 'Food'}`);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to complete crisis analysis. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
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
              Using AI-driven indicators and pickle-based ML models to detect early signs of socio-economic instability.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            <Tabs
              value={crisisType}
              onValueChange={(v) => setCrisisType(v as 'economic' | 'food')}
              disabled={loading}
            >
              <TabsList>
                <TabsTrigger value="economic">Economic Crisis</TabsTrigger>
                <TabsTrigger value="food">Food Crisis</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={forecastYear} onValueChange={setForecastYear} disabled={loading}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">Analysis Year: 2024</SelectItem>
                <SelectItem value="2025">Analysis Year: 2025</SelectItem>
                <SelectItem value="2026">Analysis Year: 2026</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={runAnalysis}
              disabled={loading}
              size="lg"
              className="px-8"
            >
              <Zap className="mr-2 h-4 w-4" />
              {loading 
                ? `Analyzing... ${progress.current}/${progress.total}` 
                : 'Run Crisis Prediction Analysis'
              }
            </Button>

            {/* Progress Bar */}
            {loading && progress.total > 0 && (
              <div className="w-full max-w-md mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
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
                      🚨 High-Risk Alert for {forecastYear}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      The following countries show a significant 
                      {crisisType === 'economic' ? ' economic' : ' food'} crisis probability (
                      &gt;50%) and require close monitoring.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {highRiskCountries.slice(0, 10).map((result) => (
                        <span
                          key={result.country}
                          className="px-3 py-1 bg-destructive/20 text-destructive-foreground rounded-full text-sm font-medium"
                        >
                          {result.country} • {result.probability.toFixed(1)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-destructive" />
                Prediction of{' '}
                {crisisType === 'economic' ? 'Economic' : 'Food'} Crisis for{' '}
                {forecastYear}
              </h2>
              <p className="text-muted-foreground mb-6">
                Filtered Report: {results.length} Countries with &gt;50% Probability
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <Card 
                    key={result.country} 
                    className={`border-2 transition-all ${
                      result.probability > 80 
                        ? 'border-destructive bg-destructive/5' 
                        : 'border-border/50 hover:border-destructive/50'
                    }`}
                  >
                    <CardContent className="pt-6">
                      {/* Country Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h3 className="text-xl font-bold">{result.country}</h3>
                      </div>

                      {/* Probability Display */}
                      <div className="text-center mb-6">
                        <p className="text-sm text-muted-foreground mb-2">
                          Crisis Probability
                        </p>
                        <p className={`text-5xl font-bold ${
                          result.probability > 80 
                            ? 'text-destructive' 
                            : 'text-orange-500'
                        }`}>
                          {result.probability.toFixed(2)}%
                        </p>
                        <p className="text-sm font-semibold text-muted-foreground mt-2">
                          {result.classification}
                        </p>
                      </div>

                      {/* Risk Indicator Bar */}
                      <div className="mb-6">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              result.probability > 80
                                ? 'bg-destructive'
                                : result.probability > 65
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${result.probability}%` }}
                          />
                        </div>
                      </div>

                      {/* Top Indicators */}
                      {result.topIndicators && result.topIndicators.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-3">
                            Top 3 Contributing Indicators
                          </p>
                          <div className="space-y-3">
                            {result.topIndicators.map((indicator, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">
                                    {idx + 1}. {indicator.name.substring(0, 35)}
                                    {indicator.name.length > 35 ? '...' : ''}
                                  </span>
                                  <span className="text-destructive font-semibold">
                                    {indicator.impact.toFixed(3)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Value:</span>
                                  <span className="text-foreground font-medium">
                                    {indicator.value.toFixed(2)}
                                  </span>
                                </div>
                                {/* Mini progress bar for impact */}
                                <div className="w-full bg-muted rounded h-1 overflow-hidden">
                                  <div
                                    className="bg-destructive/70 h-full"
                                    style={{ 
                                      width: `${Math.min(Math.abs(indicator.impact) * 100, 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Debug Info (optional - comment out for production) */}
                      <div className="mt-4 pt-4 border-t border-muted text-xs text-muted-foreground">
                        <p>Model: {crisisType === 'economic' ? 'Economic Crisis' : 'Food Crisis'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary Stats */}
              <Card className="mt-8 bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{results.length}</p>
                      <p className="text-sm text-muted-foreground">Countries at Risk</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {(results.reduce((sum, r) => sum + r.probability, 0) / results.length).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Average Risk</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">
                        {results.filter(r => r.probability > 80).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Critical Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to Analyze Global Risks
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Select the crisis type and click "Run Crisis Prediction Analysis" to analyze global risk
                indicators using predictive models.
              </p>
              <p className="text-sm text-muted-foreground">
                Select "Economic Crisis" or "Food Crisis" and analyze global indicators
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State Message */}
        {loading && results.length === 0 && (
          <Card className="py-12 border-primary">
            <CardContent className="text-center">
              <div className="animate-spin mb-4 flex justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analyzing Countries...
              </h3>
              <p className="text-muted-foreground">
                Processing {progress.total} countries with {crisisType === 'economic' ? 'economic' : 'food'} crisis models
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CrisisAnalyzer;