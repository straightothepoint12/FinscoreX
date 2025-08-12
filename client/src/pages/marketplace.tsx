import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Users,
  Target,
  ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/financial-calculations";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");

  const { data: marketplaceLoans = [], isLoading } = useQuery({
    queryKey: ["/api/loans/marketplace"],
  });

  const investMutation = useMutation({
    mutationFn: async (data: { loanId: string; amount: string }) => {
      const response = await apiRequest("POST", "/api/investments", {
        loanId: data.loanId,
        amount: data.amount,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Investment successful",
        description: "Your investment has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments/my"] });
      setSelectedLoan(null);
      setInvestmentAmount("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      const errorMessage = error.message.includes("exceeds remaining funding") 
        ? "Amount exceeds remaining funding needed"
        : "Unable to create investment";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

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

  const getGradeDescription = (grade: string) => {
    switch (grade) {
      case "A":
        return "Very low risk - Excellent borrower";
      case "B":
        return "Moderate risk - Good borrower";
      case "C":
        return "High risk - Fair borrower";
      case "D":
        return "Very high risk - Risky borrower";
      case "E":
        return "Critical risk - High-risk borrower";
      default:
        return "Grade not defined";
    }
  };

  // Filter and sort loans
  const filteredLoans = marketplaceLoans.filter((loan: any) => {
    const matchesSearch = loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.borrower.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.borrower.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "all" || loan.creditGrade === gradeFilter;
    return matchesSearch && matchesGrade;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "amount":
        return parseFloat(b.amount) - parseFloat(a.amount);
      case "rate":
        return parseFloat(b.interestRate || "0") - parseFloat(a.interestRate || "0");
      case "grade":
        return (a.creditGrade || "Z").localeCompare(b.creditGrade || "Z");
      case "funding":
        return b.fundingPercentage - a.fundingPercentage;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleInvest = (loan: any) => {
    if (user?.userType !== "investor") {
      toast({
        title: "Access denied",
        description: "Only investors can invest",
        variant: "destructive",
      });
      return;
    }
    setSelectedLoan(loan);
  };

  const confirmInvestment = () => {
    if (!selectedLoan || !investmentAmount) return;
    
    const amount = parseFloat(investmentAmount);
    const remainingAmount = parseFloat(selectedLoan.amount) - parseFloat(selectedLoan.totalFunded || "0");
    
    if (amount > remainingAmount) {
      toast({
        title: "Invalid amount",
        description: `Maximum amount is ${formatCurrency(remainingAmount)}`,
        variant: "destructive",
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Amount too low",
        description: "Minimum investment is $100",
        variant: "destructive",
      });
      return;
    }

    investMutation.mutate({
      loanId: selectedLoan.id,
      amount: investmentAmount,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="marketplace-page">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4" data-testid="marketplace-title">
            Investment Marketplace
          </h1>
          <p className="text-xl text-neutral-600">
            Discover investment opportunities and diversify your portfolio
          </p>
        </div>

        {/* Filters and Search */}
        <Card data-testid="filters-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Search for loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger data-testid="grade-filter">
                  <SelectValue placeholder="Filter by grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All grades</SelectItem>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="D">Grade D</SelectItem>
                  <SelectItem value="E">Grade E</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Most recent</SelectItem>
                  <SelectItem value="amount">Amount descending</SelectItem>
                  <SelectItem value="rate">Rate descending</SelectItem>
                  <SelectItem value="grade">Grade (A to E)</SelectItem>
                  <SelectItem value="funding">Funding descending</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-600">
                  {filteredLoans.length} opportunit{filteredLoans.length !== 1 ? 'ies' : 'y'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-neutral-800">
                {marketplaceLoans.length || 0}
              </div>
              <div className="text-sm text-neutral-600">Available opportunities</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-neutral-800">
                {formatCurrency(
                  marketplaceLoans.reduce((sum: number, loan: any) => sum + parseFloat(loan.amount), 0).toString()
                )}
              </div>
              <div className="text-sm text-neutral-600">Total volume</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-neutral-800">
                {marketplaceLoans.length 
                  ? (marketplaceLoans.reduce((sum: number, loan: any) => sum + parseFloat(loan.interestRate || "0"), 0) / marketplaceLoans.length).toFixed(1)
                  : "0"
                }%
              </div>
              <div className="text-sm text-neutral-600">Average rate</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-neutral-800">
                {marketplaceLoans.reduce((sum: number, loan: any) => sum + (loan.investments?.length || 0), 0)}
              </div>
              <div className="text-sm text-neutral-600">Active investments</div>
            </CardContent>
          </Card>
        </div>

        {/* Loans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))
          ) : filteredLoans.length > 0 ? (
            filteredLoans.map((loan: any) => {
              const remainingAmount = parseFloat(loan.amount) - parseFloat(loan.totalFunded || "0");
              
              return (
                <Card 
                  key={loan.id} 
                  className="hover:shadow-lg transition-shadow duration-300"
                  data-testid={`loan-card-${loan.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getGradeBadgeColor(loan.creditGrade || "E")}`}>
                        Grade {loan.creditGrade || "E"}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-secondary">
                          {loan.interestRate}%
                        </div>
                        <div className="text-xs text-neutral-500">Annual rate</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-neutral-800 mb-2">
                        {formatCurrency(loan.amount)}
                      </h3>
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {loan.purpose}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Duration</span>
                        <div className="font-medium">{loan.duration} months</div>
                      </div>
                      <div>
                        <span className="text-neutral-500">Score</span>
                        <div className="font-medium">{loan.creditScore}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-neutral-500">Funding</span>
                        <span className="text-sm font-medium">
                          {loan.fundingPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={loan.fundingPercentage} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Funded: {formatCurrency(loan.totalFunded || "0")}</span>
                        <span>Remaining: {formatCurrency(remainingAmount)}</span>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <div className="text-xs text-neutral-600 mb-1">
                        Risk: {getGradeDescription(loan.creditGrade || "E")}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Borrower: {loan.borrower.firstName} {loan.borrower.lastName?.[0]}.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            data-testid={`view-details-${loan.id}`}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border border-neutral-200 shadow-lg max-w-2xl" data-testid="loan-details-dialog">
                          <DialogHeader className="border-b border-neutral-100 pb-4 mb-4">
                            <DialogTitle className="text-xl font-semibold text-neutral-800">Loan Details</DialogTitle>
                            <DialogDescription className="text-neutral-600">
                              Complete information about this {loan.purpose.toLowerCase()} loan request.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-neutral-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3 text-neutral-800">Loan Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Amount:</span>
                                    <span className="font-semibold">{formatCurrency(loan.amount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Duration:</span>
                                    <span className="font-semibold">{loan.duration} months</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Interest Rate:</span>
                                    <span className="font-semibold">{loan.interestRate}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Monthly Payment:</span>
                                    <span className="font-semibold">{formatCurrency(loan.monthlyPayment || "0")}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-neutral-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3 text-neutral-800">Credit Profile</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Credit Score:</span>
                                    <span className="font-semibold">{loan.creditScore || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Credit Grade:</span>
                                    <span className={`font-semibold px-2 py-1 rounded text-xs ${getGradeBadgeColor(loan.creditGrade || "E")}`}>
                                      {loan.creditGrade}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Annual Income:</span>
                                    <span className="font-semibold">{formatCurrency(loan.annualIncome || "0")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Employment:</span>
                                    <span className="font-semibold">{loan.employmentYears || 0} years</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Purpose */}
                            <div className="bg-neutral-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 text-neutral-800">Loan Purpose</h4>
                              <p className="text-sm text-neutral-700">{loan.purpose}</p>
                            </div>

                            {/* Funding Progress */}
                            <div className="bg-neutral-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-3 text-neutral-800">Funding Progress</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span>Progress:</span>
                                  <span className="font-semibold">{loan.fundingPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2 transition-all duration-300"
                                    style={{ width: `${Math.min(loan.fundingPercentage, 100)}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Funded:</span>
                                    <span className="font-semibold text-primary">{formatCurrency(loan.totalFunded || "0")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">Remaining:</span>
                                    <span className="font-semibold">{formatCurrency(remainingAmount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Borrower Info */}
                            <div className="bg-neutral-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 text-neutral-800">Borrower Profile</h4>
                              <div className="text-sm text-neutral-700">
                                <p>Name: {loan.borrower.firstName} {loan.borrower.lastName}</p>
                                <p>Home Ownership: {loan.homeOwnership || "Not specified"}</p>
                                <p>Credit History: {loan.creditHistory || 0} years</p>
                                <p>Previous Loans: {loan.previousLoans || 0}</p>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter className="border-t border-neutral-100 pt-4 mt-6">
                            <Button variant="outline" onClick={() => {}}>
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleInvest(loan)}
                            disabled={loan.fundingPercentage >= 100 || user?.userType !== "investor"}
                            data-testid={`invest-button-${loan.id}`}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Invest
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border border-neutral-200 shadow-lg" data-testid="investment-dialog">
                          <DialogHeader className="border-b border-neutral-100 pb-4 mb-4">
                            <DialogTitle className="text-xl font-semibold text-neutral-800">Invest in this loan</DialogTitle>
                            <DialogDescription className="text-neutral-600">
                              You are about to invest in a grade {loan?.creditGrade} loan with an interest rate of {loan?.interestRate}%.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 p-4 rounded-lg border border-neutral-200">
                              <h4 className="font-semibold mb-3 text-neutral-800">Loan details</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-white p-2 rounded border">
                                  <div className="text-neutral-500">Total amount</div>
                                  <div className="font-semibold text-neutral-800">{formatCurrency(loan.amount)}</div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <div className="text-neutral-500">Duration</div>
                                  <div className="font-semibold text-neutral-800">{loan.duration} months</div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <div className="text-neutral-500">Already funded</div>
                                  <div className="font-semibold text-neutral-800">{formatCurrency(loan.totalFunded || "0")}</div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <div className="text-neutral-500">Remaining to fund</div>
                                  <div className="font-semibold text-primary">{formatCurrency(remainingAmount)}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="investment-amount" className="text-sm font-medium text-neutral-700">Amount to invest ($)</Label>
                              <Input
                                id="investment-amount"
                                type="number"
                                min="100"
                                max={remainingAmount}
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                placeholder={`Min: $100 - Max: ${formatCurrency(remainingAmount)}`}
                                className="border-neutral-300 focus:border-primary focus:ring-primary"
                                data-testid="investment-amount-input"
                              />
                            </div>
                            
                            {investmentAmount && parseFloat(investmentAmount) >= 100 && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">Investment Summary</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <div className="text-green-700">Estimated gain:</div>
                                    <div className="font-bold text-green-800">{formatCurrency(
                                      (parseFloat(investmentAmount) * parseFloat(loan.interestRate || "0") / 100 * loan.duration / 12).toString()
                                    )}</div>
                                  </div>
                                  <div>
                                    <div className="text-green-700">Total expected:</div>
                                    <div className="font-bold text-green-800">{formatCurrency(
                                      (parseFloat(investmentAmount) * (1 + parseFloat(loan.interestRate || "0") / 100 * loan.duration / 12)).toString()
                                    )}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <DialogFooter className="border-t border-neutral-100 pt-4 mt-6 flex gap-3">
                            <Button 
                              variant="outline" 
                              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                              onClick={() => {
                                setSelectedLoan(null);
                                setInvestmentAmount("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="bg-primary hover:bg-blue-700 text-white font-medium"
                              onClick={() => {
                                setSelectedLoan(loan);
                                confirmInvestment();
                              }}
                              disabled={!investmentAmount || parseFloat(investmentAmount) < 100 || investMutation.isPending}
                              data-testid="confirm-investment"
                            >
                              {investMutation.isPending ? "Investing..." : "Confirm Investment"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12" data-testid="no-loans-message">
              <Target className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-medium text-neutral-700 mb-2">
                No opportunities found
              </h3>
              <p className="text-neutral-500">
                Adjust your filters to see more investment opportunities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
