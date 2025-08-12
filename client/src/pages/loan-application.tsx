import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Calculator, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency, calculateMonthlyPayment } from "@/lib/financial-calculations";
import { isUnauthorizedError } from "@/lib/authUtils";

const loanApplicationSchema = z.object({
  amount: z.string().min(1, "Amount required").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 1000 && Number(val) <= 100000,
    "Amount between $1,000 and $100,000"
  ),
  purpose: z.string().min(10, "Project description required (min. 10 characters)"),
  duration: z.string().refine((val) => ["12", "24", "36", "48", "60"].includes(val), "Invalid duration"),
  annualIncome: z.string().min(1, "Annual income required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Invalid income"
  ),
  employmentYears: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 50,
    "Invalid employment years"
  ),
  currentDebt: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "Invalid current debt"
  ),
  homeOwnership: z.enum(["rent", "own", "mortgage"]),
  bankAccount: z.boolean(),
  creditHistory: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 50,
    "Invalid credit history"
  ),
  previousLoans: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "Invalid number of previous loans"
  ),
});

type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>;

export default function LoanApplication() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [creditScore, setCreditScore] = useState<{
    creditScore: number;
    creditGrade: string;
    interestRate: string;
  } | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  const form = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      amount: "",
      purpose: "",
      duration: "36",
      annualIncome: "",
      employmentYears: "",
      currentDebt: "",
      homeOwnership: "rent",
      bankAccount: true,
      creditHistory: "",
      previousLoans: "0",
    },
  });

  // Redirect if not authenticated or not a borrower
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.userType !== "borrower"))) {
      toast({
        title: "Access denied",
        description: "Only borrowers can apply for loans.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  const calculateCreditScoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/credit-score", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCreditScore(data);
    },
    onError: (error) => {
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
      toast({
        title: "Error",
        description: "Could not calculate credit score",
        variant: "destructive",
      });
    },
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanApplicationFormData) => {
      const response = await apiRequest("POST", "/api/loans", {
        ...data,
        amount: data.amount,
        duration: parseInt(data.duration),
        annualIncome: data.annualIncome,
        employmentYears: parseInt(data.employmentYears),
        currentDebt: data.currentDebt,
        creditHistory: parseInt(data.creditHistory),
        previousLoans: parseInt(data.previousLoans),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application created",
        description: "Your loan application has been submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans/my"] });
      setLocation("/borrower-dashboard");
    },
    onError: (error) => {
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
      toast({
        title: "Error",
        description: "Could not create loan application",
        variant: "destructive",
      });
    },
  });

  // Watch form values for real-time credit score calculation
  const watchedValues = form.watch();
  
  useEffect(() => {
    const { 
      amount, 
      duration, 
      annualIncome, 
      currentDebt, 
      employmentYears, 
      creditHistory, 
      previousLoans, 
      homeOwnership, 
      bankAccount 
    } = watchedValues;

    if (annualIncome && currentDebt && employmentYears && creditHistory) {
      const debounceTimer = setTimeout(() => {
        calculateCreditScoreMutation.mutate({
          annualIncome: parseFloat(annualIncome),
          currentDebt: parseFloat(currentDebt),
          employmentYears: parseInt(employmentYears),
          creditHistory: parseInt(creditHistory),
          previousLoans: parseInt(previousLoans || "0"),
          homeOwnership,
          bankAccount,
        });
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [watchedValues]);

  // Calculate monthly payment when amount, duration, or interest rate changes
  useEffect(() => {
    const { amount, duration } = watchedValues;
    if (amount && duration && creditScore?.interestRate) {
      const payment = calculateMonthlyPayment(
        parseFloat(amount),
        parseFloat(creditScore.interestRate),
        parseInt(duration)
      );
      setMonthlyPayment(payment);
    }
  }, [watchedValues.amount, watchedValues.duration, creditScore?.interestRate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.userType !== "borrower") {
    return null;
  }

  const onSubmit = (data: LoanApplicationFormData) => {
    createLoanMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6" data-testid="loan-application-page">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4" data-testid="page-title">
            Loan Application
          </h1>
          <p className="text-xl text-neutral-600">
            Complete the form to get an instant assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card data-testid="loan-application-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="25000"
                                data-testid="input-loan-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (months)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-loan-duration">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="12">12 months</SelectItem>
                                <SelectItem value="24">24 months</SelectItem>
                                <SelectItem value="36">36 months</SelectItem>
                                <SelectItem value="48">48 months</SelectItem>
                                <SelectItem value="60">60 months</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan purpose</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe intended use of funds..."
                              className="min-h-[100px]"
                              data-testid="textarea-loan-purpose"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Financial Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="annualIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual income ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="45000"
                                  data-testid="input-annual-income"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currentDebt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current monthly debt ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="800"
                                  data-testid="input-current-debt"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="employmentYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years at current job</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="3"
                                  data-testid="input-employment-years"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="creditHistory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit history years</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="5"
                                  data-testid="input-credit-history"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="homeOwnership"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Housing status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-home-ownership">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="rent">Tenant</SelectItem>
                                  <SelectItem value="own">Owner</SelectItem>
                                  <SelectItem value="mortgage">Mortgage</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="previousLoans"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Previous loans repaid</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="2"
                                  data-testid="input-previous-loans"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-bank-account"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I have a bank account
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createLoanMutation.isPending}
                      data-testid="submit-loan-application"
                    >
                      {createLoanMutation.isPending ? "Creating..." : "Submit my application"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Credit Score Card */}
            <Card data-testid="credit-score-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Instant Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {creditScore ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2" data-testid="credit-score-value">
                        {creditScore.creditScore}
                      </div>
                      <div className={`text-sm px-3 py-1 rounded-full font-medium inline-block mb-2 ${
                        creditScore.creditGrade === 'A' ? 'bg-secondary text-white' :
                        creditScore.creditGrade === 'B' ? 'bg-primary text-white' :
                        'bg-yellow-500 text-white'
                      }`} data-testid="credit-grade">
                        Grade {creditScore.creditGrade}
                      </div>
                      <p className="text-sm text-neutral-600">Credit Score</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Estimated Interest Rate</span>
                        <span className="font-semibold text-secondary" data-testid="interest-rate">
                          {creditScore.interestRate}%
                        </span>
                      </div>
                      
                      {monthlyPayment > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Estimated Monthly Payment</span>
                          <span className="font-semibold text-neutral-800" data-testid="monthly-payment">
                            {formatCurrency(monthlyPayment)}
                          </span>
                        </div>
                      )}

                      {watchedValues.duration && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Duration</span>
                          <span className="font-semibold text-neutral-800">
                            {watchedValues.duration} months
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-neutral-500" data-testid="credit-score-placeholder">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                    <p className="text-sm">Complete the financial information to see your evaluation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card data-testid="tips-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-neutral-600">
                  <p className="font-medium mb-2">To improve your score:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Reduce your debt-to-income ratio</li>
                    <li>• Maintain a positive credit history</li>
                    <li>• Employment stability is important</li>
                    <li>• Valued real estate property</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
