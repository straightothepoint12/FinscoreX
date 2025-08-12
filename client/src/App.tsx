import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import LoanApplication from "@/pages/loan-application";
import BorrowerDashboard from "@/pages/borrower-dashboard";
import InvestorDashboard from "@/pages/investor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Marketplace from "@/pages/marketplace";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Switch>
        {isLoading || !isAuthenticated ? (
          <>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={Landing} />
          </>
        ) : (
          <div>
            <Navigation />
            <Route path="/" component={Home} />
            <Route path="/loan-application" component={LoanApplication} />
            <Route path="/borrower-dashboard" component={BorrowerDashboard} />
            <Route path="/investor-dashboard" component={InvestorDashboard} />
            <Route path="/admin-dashboard" component={AdminDashboard} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/profile" component={Profile} />
            <Route path="/settings" component={Settings} />
          </div>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.title = "FinScoreX - Peer-to-Peer Lending Platform";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
