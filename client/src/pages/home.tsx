import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Link } from "wouter";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  PieChart,
  ArrowRight,
  Plus,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/financial-calculations";

export default function Home() {
  const { user, isLoading } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !isLoading && !!user,
  });

  const { data: marketplaceLoans } = useQuery({
    queryKey: ["/api/loans/marketplace"],
    enabled: !isLoading && !!user,
  });

  const { data: userLoans } = useQuery({
    queryKey: ["/api/loans/my"],
    enabled: !isLoading && !!user && user?.userType === "borrower",
  });

  const { data: userInvestments } = useQuery({
    queryKey: ["/api/investments/my"],
    enabled: !isLoading && !!user && user?.userType === "investor",
  });

  if (isLoading || !user) {
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

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="home-page">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2" data-testid="welcome-message">
                Hello, {user.firstName || user.email?.split('@')[0]}!
              </h1>
              <p className="text-xl text-neutral-600" data-testid="user-type-message">
                {user.userType === "borrower" && "Manage your loans and funding requests"}
                {user.userType === "investor" && "Discover new investment opportunities"}
                {user.userType === "admin" && "Administrator dashboard"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Account type</p>
              <p className="text-lg font-semibold text-primary capitalize" data-testid="account-type">
                {user.userType}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user.userType === "borrower" && (
            <>
              <MetricCard
                title="Active Loans"
                value={userStats?.activeLoans || 0}
                icon={<DollarSign className="h-4 w-4" />}
                className="border-primary/20"
                data-testid="metric-active-loans"
              />
              <MetricCard
                title="Total Borrowed"
                value={formatCurrency(userStats?.totalBorrowed || "0")}
                icon={<TrendingUp className="h-4 w-4" />}
                className="border-secondary/20"
                data-testid="metric-total-borrowed"
              />
              <MetricCard
                title="Nouvelles Offres"
                value={marketplaceLoans?.length || 0}
                changeType="positive"
                change="Disponibles"
                icon={<Eye className="h-4 w-4" />}
                data-testid="metric-available-loans"
              />
            </>
          )}

          {user.userType === "investor" && (
            <>
              <MetricCard
                title="Total Invested"
                value={formatCurrency(userStats?.totalInvested || "0")}
                icon={<DollarSign className="h-4 w-4" />}
                className="border-primary/20"
                data-testid="metric-total-invested"
              />
              <MetricCard
                title="Gains Totaux"
                value={formatCurrency(userStats?.totalReturn || "0")}
                changeType="positive"
                change={`ROI: ${userStats?.avgReturn || "0"}%`}
                icon={<TrendingUp className="h-4 w-4" />}
                className="border-secondary/20"
                data-testid="metric-total-returns"
              />
              <MetricCard
                title="Active Investments"
                value={userStats?.activeInvestments || 0}
                icon={<PieChart className="h-4 w-4" />}
                data-testid="metric-active-investments"
              />
            </>
          )}

          {user.userType === "admin" && (
            <>
              <MetricCard
                title="Utilisateurs"
                value="2,847"
                changeType="positive"
                change="+12% ce mois"
                icon={<Users className="h-4 w-4" />}
                data-testid="metric-total-users"
              />
              <MetricCard
                title="Volume Total"
                value="€42.8M"
                changeType="positive"
                change="+18% ce mois"
                icon={<DollarSign className="h-4 w-4" />}
                data-testid="metric-total-volume"
              />
              <MetricCard
                title="ROI Moyen"
                value="11.2%"
                changeType="positive"
                change="+1.1% ce mois"
                icon={<TrendingUp className="h-4 w-4" />}
                data-testid="metric-average-roi"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.userType === "borrower" && (
                <>
                  <Link href="/loan-application">
                    <Button className="w-full justify-between" data-testid="action-new-loan">
                      New Loan Application
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/borrower-dashboard">
                    <Button variant="outline" className="w-full justify-between" data-testid="action-view-loans">
                      Manage My Loans
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}

              {user.userType === "investor" && (
                <>
                  <Link href="/marketplace">
                    <Button className="w-full justify-between" data-testid="action-browse-marketplace">
                      Explorer la Marketplace
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/investor-dashboard">
                    <Button variant="outline" className="w-full justify-between" data-testid="action-view-portfolio">
                      Voir Mon Portfolio
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}

              {user.userType === "admin" && (
                <>
                  <Link href="/admin-dashboard">
                    <Button className="w-full justify-between" data-testid="action-admin-dashboard">
                      Tableau de Bord Admin
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button variant="outline" className="w-full justify-between" data-testid="action-manage-platform">
                      Gérer la Plateforme
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-testid="recent-activity-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.userType === "borrower" && userLoans && userLoans.length > 0 ? (
                <div className="space-y-3">
                  {userLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg" data-testid={`recent-loan-${loan.id}`}>
                      <div>
                        <p className="font-medium text-neutral-800">{loan.purpose}</p>
                        <p className="text-sm text-neutral-500">{formatCurrency(loan.amount)}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        loan.status === 'approved' ? 'bg-secondary/20 text-secondary' :
                        loan.status === 'funded' ? 'bg-primary/20 text-primary' :
                        'bg-neutral-200 text-neutral-600'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : user.userType === "investor" && userInvestments && userInvestments.length > 0 ? (
                <div className="space-y-3">
                  {userInvestments.slice(0, 3).map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg" data-testid={`recent-investment-${investment.id}`}>
                      <div>
                        <p className="font-medium text-neutral-800">{investment.loan.purpose}</p>
                        <p className="text-sm text-neutral-500">{formatCurrency(investment.amount)} investis</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary">{investment.interestRate}%</p>
                        <p className="text-xs text-neutral-500">Grade {investment.loan.creditGrade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500" data-testid="no-recent-activity">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">
                    {user.userType === "borrower" && "Start by making a loan application"}
                    {user.userType === "investor" && "Explore the marketplace for your first investments"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Preview */}
        {marketplaceLoans && marketplaceLoans.length > 0 && (
          <Card data-testid="marketplace-preview-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Opportunités du Moment
                </span>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm" data-testid="view-all-marketplace">
                    Voir Tout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceLoans.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="p-4 bg-neutral-50 rounded-lg border" data-testid={`marketplace-loan-${loan.id}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        loan.creditGrade === 'A' ? 'bg-secondary text-white' :
                        loan.creditGrade === 'B' ? 'bg-primary text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        Grade {loan.creditGrade}
                      </span>
                      <span className="text-sm font-semibold text-secondary">{loan.interestRate}%</span>
                    </div>
                    <p className="font-medium text-neutral-800 mb-1">{formatCurrency(loan.amount)}</p>
                    <p className="text-sm text-neutral-600 mb-2">{loan.purpose}</p>
                    <div className="flex justify-between items-center text-xs text-neutral-500">
                      <span>Score: {loan.creditScore}</span>
                      <span>{loan.duration} mois</span>
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
