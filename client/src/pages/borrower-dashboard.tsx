import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  Calculator,
  Trash2
} from "lucide-react";
import { formatCurrency } from "@/lib/financial-calculations";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BorrowerDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not a borrower
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.userType !== "borrower"))) {
      toast({
        title: "Access denied",
        description: "Only borrowers can access this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  const { data: userLoans, isLoading: loansLoading } = useQuery({
    queryKey: ["/api/loans/my"],
    enabled: !isLoading && !!user && user.userType === "borrower",
    retry: false,
  });

  const deleteLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      return await apiRequest("DELETE", `/api/loans/${loanId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans/my"] });
      toast({
        title: "Loan deleted",
        description: "Your loan application has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete the loan application.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user || user.userType !== "borrower") {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "funded":
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "defaulted":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return "Draft";
      case "submitted": return "Submitted";
      case "under_review": return "Under review";
      case "approved": return "Approved";
      case "funded": return "Funded";
      case "active": return "Active";
      case "completed": return "Completed";
      case "defaulted": return "Defaulted";
      default: return status;
    }
  };

  const loans = (userLoans as any[]) || [];
  const activeLoans = loans.filter((loan: any) => 
    ["approved", "funded", "active"].includes(loan.status)
  );

  const totalBorrowed = loans.reduce((sum: number, loan: any) => 
    sum + parseFloat(loan.amount), 0
  );

  const totalFunded = loans.reduce((sum: number, loan: any) => 
    sum + parseFloat(loan.totalFunded || "0"), 0
  );

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="borrower-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2" data-testid="dashboard-title">
              My Loans
            </h1>
            <p className="text-xl text-neutral-600">
              Manage your loan applications and track your repayments
            </p>
          </div>
          <Link href="/loan-application">
            <Button className="bg-primary hover:bg-blue-700" data-testid="new-loan-button">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Active Loans"
            value={activeLoans.length}
            icon={<DollarSign className="h-4 w-4" />}
            className="border-primary/20"
            data-testid="metric-active-loans"
          />
          <MetricCard
            title="Total Requested"
            value={formatCurrency(totalBorrowed)}
            icon={<TrendingUp className="h-4 w-4" />}
            className="border-secondary/20"
            data-testid="metric-total-requested"
          />
          <MetricCard
            title="Total Funded"
            value={formatCurrency(totalFunded)}
            changeType="positive"
            change={`${((totalFunded / totalBorrowed) * 100 || 0).toFixed(1)}% of total`}
            icon={<CheckCircle className="h-4 w-4" />}
            data-testid="metric-total-funded"
          />
          <MetricCard
            title="Total Loans"
            value={loans.length}
            icon={<Eye className="h-4 w-4" />}
            data-testid="metric-total-loans"
          />
        </div>

        {/* Loans List */}
        <Card data-testid="loans-list-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Application History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loansLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : loans && loans.length > 0 ? (
              <div className="space-y-4">
                {loans.map((loan: any) => (
                  <div 
                    key={loan.id} 
                    className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow"
                    data-testid={`loan-card-${loan.id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(loan.status)}
                          <h3 className="text-lg font-semibold text-neutral-800">
                            {loan.purpose.length > 50 
                              ? `${loan.purpose.substring(0, 50)}...` 
                              : loan.purpose
                            }
                          </h3>
                        </div>
                        <Badge 
                          variant={getStatusBadgeVariant(loan.status)}
                          data-testid={`loan-status-${loan.id}`}
                        >
                          {getStatusText(loan.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(loan.amount)}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {loan.duration} mois
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-neutral-500">Credit Score</div>
                        <div className="text-lg font-bold text-secondary">
                          {loan.creditScore || "N/A"}
                        </div>
                        {loan.creditGrade && (
                          <div className="text-xs text-neutral-400">
                            Grade {loan.creditGrade}
                          </div>
                        )}
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-neutral-500">Interest Rate</div>
                        <div className="text-lg font-bold text-neutral-800">
                          {loan.interestRate ? `${loan.interestRate}%` : "N/A"}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-neutral-500">Monthly Payment</div>
                        <div className="text-lg font-bold text-neutral-800">
                          {loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : "N/A"}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-neutral-500">Funded</div>
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(loan.totalFunded || "0")}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {loan.fundingPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Funding Progress */}
                    {loan.status === "approved" && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-neutral-600">Progression du financement</span>
                          <span className="text-sm font-medium">
                            {loan.fundingPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={loan.fundingPercentage} 
                          className="h-2"
                          data-testid={`funding-progress-${loan.id}`}
                        />
                      </div>
                    )}

                    {/* Investments Summary */}
                    {loan.investments && loan.investments.length > 0 && (
                      <div className="border-t border-neutral-200 pt-4">
                        <h4 className="text-sm font-medium text-neutral-700 mb-3">
                          Investisseurs ({loan.investments.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {loan.investments.slice(0, 3).map((investment: any, index: number) => (
                            <div 
                              key={investment.id} 
                              className="flex items-center justify-between p-3 bg-white rounded-lg border"
                              data-testid={`investment-${investment.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-neutral-800">
                                    Investisseur #{index + 1}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    {formatCurrency(investment.amount)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-secondary">
                                  {investment.interestRate}%
                                </div>
                                <div className="text-xs text-neutral-400">
                                  {investment.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {loan.investments.length > 3 && (
                          <div className="text-center mt-3">
                            <span className="text-sm text-neutral-500">
                              +{loan.investments.length - 3} other investors
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // For now, show a toast with loan details
                          toast({
                            title: "Loan Details",
                            description: `Loan #${loan.id.slice(0, 8)}... - Amount: €${loan.amount.toLocaleString()} - Rate: ${loan.interestRate}% - Status: ${loan.status}`,
                          });
                        }}
                        data-testid={`view-details-${loan.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {loan.status === "active" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`view-payments-${loan.id}`}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      )}
                      {/* Show delete button only if no investments */}
                      {(!loan.investments || loan.investments.length === 0) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this loan application? This action cannot be undone.")) {
                              deleteLoanMutation.mutate(loan.id);
                            }
                          }}
                          disabled={deleteLoanMutation.isPending}
                          data-testid={`delete-loan-${loan.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteLoanMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-loans-message">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">
                  No loan applications
                </h3>
                <p className="text-neutral-500 mb-6">
                  Start by making your first loan application
                </p>
                <Link href="/loan-application">
                  <Button data-testid="first-loan-button">
                    <Plus className="h-4 w-4 mr-2" />
                    First Application
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
