import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppSidebar from "./components/AppSidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CrisisAnalyzer from "./pages/CrisisAnalyzer";
import Countries from "./pages/Countries";
import Trends from "./pages/Trends";
import Reports from "./pages/Reports";
import FoodAnalysis from "./pages/FoodAnalysis";
import EconomyAnalysis from "./pages/EconomyAnalysis";
import Forecaster from "./pages/Forecaster";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1">
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/crisis-analyzer" element={<CrisisAnalyzer />} />
                            <Route path="/countries" element={<Countries />} />
                            <Route path="/trends" element={<Trends />} />
                            <Route path="/food-analysis" element={<FoodAnalysis />} />
                            <Route path="/economy-analysis" element={<EconomyAnalysis />} />
                            <Route path="/forecaster" element={<Forecaster />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                        <Footer />
                        <Chatbot />
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
