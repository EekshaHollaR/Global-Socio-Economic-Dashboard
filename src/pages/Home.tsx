import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingUp, AlertTriangle, BarChart3, Users, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-foreground">GSECD</span>
              <span className="text-xs text-muted-foreground">Global Socio-Economic Crisis Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Global Socio-Economic Crisis Early Detection
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced analytics platform for monitoring and predicting food security and economic crises worldwide
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <AlertTriangle className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Crisis Prediction</CardTitle>
              <CardDescription>
                AI-powered models detect food and economic crises before they escalate
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Monitor key indicators across 190+ countries with live data updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>5-Year Forecasting</CardTitle>
              <CardDescription>
                Advanced forecasting models predict trends up to 5 years ahead
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Interactive Maps</CardTitle>
              <CardDescription>
                Visual representation of global data with country-specific insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-Indicator Analysis</CardTitle>
              <CardDescription>
                Track GDP, inflation, food prices, and 20+ economic indicators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Comprehensive risk scoring with severity levels and alerts
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Indicators Section */}
      <section className="container py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Indicators We Track</h2>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Economic Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>GDP Growth:</strong> Annual percentage change in gross domestic product</li>
                  <li>• <strong>Inflation Rate:</strong> Consumer price index changes year-over-year</li>
                  <li>• <strong>Unemployment Rate:</strong> Percentage of labor force without jobs</li>
                  <li>• <strong>Public Debt:</strong> Government debt as percentage of GDP</li>
                  <li>• <strong>Trade Balance:</strong> Exports minus imports ratio</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Food Security Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Food Price Index:</strong> Weighted average of food commodity prices</li>
                  <li>• <strong>Agricultural Production:</strong> Annual crop yield changes</li>
                  <li>• <strong>Food Import Dependency:</strong> Percentage of food requirements imported</li>
                  <li>• <strong>Malnutrition Rate:</strong> Prevalence of undernourishment</li>
                  <li>• <strong>Supply Chain Stability:</strong> Food availability and access metrics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Thresholds Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Risk Threshold Explanations</h2>
          
          <div className="space-y-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">High Risk (Critical)</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>GDP decline &gt; 3%, Inflation &gt; 15%, Unemployment &gt; 12%, or Food Price Index &gt; 150</p>
                <p className="mt-2">Immediate intervention required. High probability of economic collapse or widespread food insecurity.</p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="text-orange-500">Medium Risk (Warning)</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>GDP decline 1-3%, Inflation 8-15%, Unemployment 8-12%, or Food Price Index 120-150</p>
                <p className="mt-2">Monitoring required. Potential for deterioration if conditions worsen.</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-yellow-600">Low Risk (Watch)</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>Minor fluctuations in indicators within acceptable ranges</p>
                <p className="mt-2">Stable conditions with minor concerns. Continued observation recommended.</p>
              </CardContent>
            </Card>

            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-600">No Significant Risk</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>All indicators within healthy ranges</p>
                <p className="mt-2">Stable economic and food security conditions. Normal monitoring protocols.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 GSECD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
