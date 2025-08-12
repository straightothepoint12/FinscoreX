import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Target,
  Eye,
  Plus,
  ArrowUpRight,
  Shield
} from "lucide-react";
import { formatCurrency, calculateRiskMetrics } from "@/lib/financial-calculations";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function InvestorDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or not an investor
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.userType !== "investor"))) {
      toast({
        title: "Accès refusé",
        description: "Seuls les investisseurs peuvent accéder à cette page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  const { data: userInvestments, isLoading: investmentsLoading } = useQuery({
    queryKey: ["/api/investments/my"],
    enabled: !isLoading && !!user && user.userType === "investor",
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !isLoading && !!user,
  });

  const { data: marketplaceLoans } = useQuery({
    queryKey: ["/api/loans/marketplace"],
    enabled: !isLoading && !!user,
  });

  if (isLoading || !user || user.userType !== "investor") {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-secondary text-white";
      case "B":
        return "bg-primary text-white";
      case "C":
        return "bg-yellow-500 text-white";
      case "D":
        return "bg-orange-500 text-white";
      case "E":
        return "bg-red-500 text-white";
      default:
        return "bg-neutral-500 text-white";
    }
  };

  // Calculate portfolio metrics
  const totalInvested = parseFloat(userStats?.totalInvested || "0");
  const totalReturn = parseFloat(userStats?.totalReturn || "0");
  const avgReturn = parseFloat(userStats?.avgReturn || "0");
  const activeInvestments = userStats?.activeInvestments || 0;

  // Calculate risk metrics if we have investments
  const riskMetrics = userInvestments && userInvestments.length > 0 
    ? calculateRiskMetrics(userInvestments.map(inv => ({
        amount: parseFloat(inv.amount),
        creditGrade: inv.loan.creditGrade || "E",
        actualReturn: parseFloat(inv.actualReturn || "0")
      })))
    : null;

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="investor-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2" data-testid="dashboard-title">
              Investment Portfolio
            </h1>
            <p className="text-xl text-neutral-600">
              Track your investments and discover new opportunities
            </p>
          </div>
          <Link href="/marketplace">
            <Button className="bg-primary hover:bg-blue-700" data-testid="marketplace-button">
              <Plus className="h-4 w-4 mr-2" />
              New Investments
            </Button>
          </Link>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={<DollarSign className="h-4 w-4" />}
            className="border-primary/20"
            data-testid="metric-total-invested"
          />
          <MetricCard
            title="Total Returns"
            value={formatCurrency(totalReturn)}
            changeType="positive"
            change={`ROI: ${avgReturn.toFixed(1)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            className="border-secondary/20"
            data-testid="metric-total-gains"
          />
          <MetricCard
            title="Active Investments"
            value={activeInvestments}
            icon={<Target className="h-4 w-4" />}
            data-testid="metric-active-investments"
          />
          <MetricCard
            title="Diversification"
            value={riskMetrics ? `${riskMetrics.diversificationScore.toFixed(0)}/100` : "N/A"}
            changeType={riskMetrics && riskMetrics.diversificationScore >= 70 ? "positive" : "neutral"}
            change={riskMetrics ? `Average Grade: ${riskMetrics.averageGrade}` : ""}
            icon={<Shield className="h-4 w-4" />}
            data-testid="metric-diversification"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Composition */}
          <ChartCard
            title="Risk Distribution"
            description="Distribution of your portfolio by credit grade"
            data-testid="portfolio-composition"
          >
            {riskMetrics ? (
              <div className="space-y-4">
                {Object.entries(riskMetrics.riskDistribution).map(([grade, percentage]) => (
                  <div key={grade} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getGradeBadgeColor(grade)}`}>
                          Grade {grade}
                        </span>
                        <span className="text-sm text-neutral-600">
                          {grade === "A" && "Très faible risque"}
                          {grade === "B" && "Risque modéré"}
                          {grade === "C" && "Risque élevé"}
                          {grade === "D" && "Risque très élevé"}
                          {grade === "E" && "Risque critique"}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>No investments yet</p>
                <p className="text-sm">Start investing to see your portfolio distribution</p>
              </div>
            )}
          </ChartCard>

          {/* Recent Performance */}
          <ChartCard
            title="Recent Performance"
            description="Evolution of your returns over recent months"
            data-testid="performance-chart"
          >
            <div className="text-center py-8 text-neutral-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p>Performance Chart</p>
              <p className="text-sm">To be implemented with historical data</p>
            </div>
          </ChartCard>
        </div>

        {/* My Investments */}
        <Card data-testid="investments-list">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              My Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : userInvestments && userInvestments.length > 0 ? (
              <div className="space-y-4">
                {userInvestments.map((investment) => (
                  <div 
                    key={investment.id} 
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow"
                    data-testid={`investment-card-${investment.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getGradeBadgeColor(investment.loan.creditGrade || "E")}`}>
                          Grade {investment.loan.creditGrade || "E"}
                        </span>
                        <h3 className="font-medium text-neutral-800">
                          {investment.loan.purpose.length > 40 
                            ? `${investment.loan.purpose.substring(0, 40)}...` 
                            : investment.loan.purpose
                          }
                        </h3>
                        <Badge variant={getStatusBadgeVariant(investment.status)}>
                          {investment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(investment.amount)}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-secondary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-sm text-neutral-500">Rate</div>
                        <div className="text-sm font-bold text-secondary">
                          {investment.interestRate}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-sm text-neutral-500">Duration</div>
                        <div className="text-sm font-bold text-neutral-800">
                          {investment.loan.duration} months
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-sm text-neutral-500">Expected Returns</div>
                        <div className="text-sm font-bold text-neutral-800">
                          {formatCurrency(investment.expectedReturn || "0")}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-white rounded">
                        <div className="text-sm text-neutral-500">Actual Returns</div>
                        <div className="text-sm font-bold text-secondary">
                          {formatCurrency(investment.actualReturn || "0")}
                        </div>
                      </div>
                    </div>

                    {investment.borrower && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-neutral-600">
                            Borrower: {investment.borrower.firstName} {investment.borrower.lastName?.[0]}.
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-investments-message">
                <Target className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">
                  No Investments
                </h3>
                <p className="text-neutral-500 mb-6">
                  Explore the marketplace to start investing
                </p>
                <Link href="/marketplace">
                  <Button data-testid="first-investment-button">
                    <Plus className="h-4 w-4 mr-2" />
                    First Investment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marketplace Preview */}
        {marketplaceLoans && marketplaceLoans.length > 0 && (
          <Card data-testid="marketplace-preview">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  New Opportunities
                </span>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceLoans.slice(0, 3).map((loan) => (
                  <div 
                    key={loan.id} 
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer"
                    data-testid={`opportunity-${loan.id}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getGradeBadgeColor(loan.creditGrade || "E")}`}>
                        Grade {loan.creditGrade || "E"}
                      </span>
                      <span className="text-sm font-semibold text-secondary">
                        {loan.interestRate}%
                      </span>
                    </div>
                    <p className="font-medium text-neutral-800 mb-1">
                      {formatCurrency(loan.amount)}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      {loan.purpose.length > 40 
                        ? `${loan.purpose.substring(0, 40)}...` 
                        : loan.purpose
                      }
                    </p>
                    <div className="flex justify-between items-center text-xs text-neutral-500">
                      <span>Score: {loan.creditScore}</span>
                      <span>{loan.duration} months</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-neutral-500">Funded</span>
                        <span className="text-xs font-medium">
                          {loan.fundingPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={loan.fundingPercentage} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
