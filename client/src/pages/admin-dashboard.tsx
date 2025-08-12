import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  BarChart3,
  Activity,
  Target
} from "lucide-react";
import { formatCurrency } from "@/lib/financial-calculations";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.userType !== "admin"))) {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent accéder à cette page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  const { data: platformMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
    enabled: !isLoading && !!user && user.userType === "admin",
    retry: false,
  });

  const { data: allLoans, isLoading: loansLoading } = useQuery({
    queryKey: ["/api/admin/loans"],
    enabled: !isLoading && !!user && user.userType === "admin",
    retry: false,
  });

  if (isLoading || !user || user.userType !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
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
      case "approved":
      case "funded":
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "defaulted":
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

  // Calculate loan distribution by status
  const loansByStatus = allLoans?.reduce((acc: Record<string, number>, loan) => {
    acc[loan.status] = (acc[loan.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calculate loan distribution by grade
  const loansByGrade = allLoans?.reduce((acc: Record<string, number>, loan) => {
    const grade = loan.creditGrade || "E";
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {}) || {};

  const totalLoans = allLoans?.length || 0;

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2" data-testid="dashboard-title">
            Administration
          </h1>
          <p className="text-xl text-neutral-600">
            Platform overview and global metrics
          </p>
        </div>

        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Loans"
            value={metricsLoading ? "..." : (platformMetrics?.totalLoans || 0)}
            changeType="positive"
            change="+12% this month"
            icon={<Users className="h-4 w-4" />}
            className="border-primary/20"
            data-testid="metric-total-loans"
          />
          <MetricCard
            title="Volume Total"
            value={metricsLoading ? "..." : formatCurrency(platformMetrics?.totalVolume || "0")}
            changeType="positive"
            change="+18% this month"
            icon={<DollarSign className="h-4 w-4" />}
            className="border-secondary/20"
            data-testid="metric-total-volume"
          />
          <MetricCard
            title="Default Rate"
            value={metricsLoading ? "..." : `${platformMetrics?.defaultRate || "0"}%`}
            changeType="negative"
            change="-0.3% this month"
            icon={<AlertTriangle className="h-4 w-4" />}
            className="border-orange-500/20"
            data-testid="metric-default-rate"
          />
          <MetricCard
            title="ROI Moyen"
            value={metricsLoading ? "..." : `${platformMetrics?.avgReturn || "0"}%`}
            changeType="positive"
            change="+1.1% this month"
            icon={<TrendingUp className="h-4 w-4" />}
            className="border-secondary/20"
            data-testid="metric-average-roi"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loan Status Distribution */}
          <ChartCard
            title="Status Distribution"
            description="Loan distribution by current status"
            data-testid="status-distribution"
          >
            {loansLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(loansByStatus).map(([status, count]) => {
                  const percentage = totalLoans > 0 ? (count / totalLoans) * 100 : 0;
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(status)}>
                            {status}
                          </Badge>
                          <span className="text-sm text-neutral-600 capitalize">
                            {status === "submitted" && "Soumis"}
                            {status === "under_review" && "En révision"}
                            {status === "approved" && "Approuvés"}
                            {status === "funded" && "Financés"}
                            {status === "active" && "Actifs"}
                            {status === "completed" && "Complétés"}
                            {status === "defaulted" && "En défaut"}
                            {!["submitted", "under_review", "approved", "funded", "active", "completed", "defaulted"].includes(status) && status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-neutral-500 ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>

          {/* Credit Grade Distribution */}
          <ChartCard
            title="Distribution par Grade"
            description="Loan distribution by credit grade"
            data-testid="grade-distribution"
          >
            {loansLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(loansByGrade).map(([grade, count]) => {
                  const percentage = totalLoans > 0 ? (count / totalLoans) * 100 : 0;
                  return (
                    <div key={grade} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getGradeBadgeColor(grade)}`}>
                            Grade {grade}
                          </span>
                          <span className="text-sm text-neutral-600">
                            {grade === "A" && "Excellent - Très faible risque"}
                            {grade === "B" && "Bon - Risque modéré"}
                            {grade === "C" && "Correct - Risque élevé"}
                            {grade === "D" && "Faible - Risque très élevé"}
                            {grade === "E" && "Mauvais - Risque critique"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-neutral-500 ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Risk Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card data-testid="risk-analysis">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Analyse des Risques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Low risk loans (A-B)</span>
                  <span className="font-semibold text-secondary">
                    {((((loansByGrade.A || 0) + (loansByGrade.B || 0)) / totalLoans) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">High risk loans (D-E)</span>
                  <span className="font-semibold text-orange-500">
                    {((((loansByGrade.D || 0) + (loansByGrade.E || 0)) / totalLoans) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Defaulted loans</span>
                  <span className="font-semibold text-red-500">
                    {((loansByStatus.defaulted || 0) / totalLoans * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="platform-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Santé de la Plateforme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Approval Rate</span>
                  <span className="font-semibold text-primary">
                    {((((loansByStatus.approved || 0) + (loansByStatus.funded || 0) + (loansByStatus.active || 0)) / totalLoans) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Funding Rate</span>
                  <span className="font-semibold text-secondary">
                    {(((loansByStatus.funded || 0) + (loansByStatus.active || 0)) / totalLoans * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Completed loans</span>
                  <span className="font-semibold text-neutral-800">
                    {((loansByStatus.completed || 0) / totalLoans * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="performance-indicators">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                KPIs Clés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Ticket moyen</span>
                  <span className="font-semibold text-neutral-800">
                    {formatCurrency((parseFloat(platformMetrics?.totalVolume || "0") / (platformMetrics?.totalLoans || 1)).toString())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">ROI plateforme</span>
                  <span className="font-semibold text-secondary">
                    {platformMetrics?.avgReturn || "0"}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Croissance mensuelle</span>
                  <span className="font-semibold text-primary">
                    +15.2%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Loans */}
        <Card data-testid="recent-loans">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : allLoans && allLoans.length > 0 ? (
              <div className="space-y-4">
                {allLoans.slice(0, 10).map((loan) => (
                  <div 
                    key={loan.id} 
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border"
                    data-testid={`recent-loan-${loan.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getGradeBadgeColor(loan.creditGrade || "E")}`}>
                        {loan.creditGrade || "E"}
                      </span>
                      <div>
                        <div className="font-medium text-neutral-800">
                          {loan.purpose.length > 50 
                            ? `${loan.purpose.substring(0, 50)}...` 
                            : loan.purpose
                          }
                        </div>
                        <div className="text-sm text-neutral-500">
                          {loan.borrower.firstName} {loan.borrower.lastName} • Score: {loan.creditScore}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-800">
                        {formatCurrency(loan.amount)}
                      </div>
                      <Badge variant={getStatusBadgeVariant(loan.status)}>
                        {loan.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>No loans available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
