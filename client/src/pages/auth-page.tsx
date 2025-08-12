import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Loader2, Shield, TrendingUp, Users } from "lucide-react";

const simpleAuthSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userType: z.enum(["borrower", "investor"], {
    required_error: "Please select your role",
  }),
});

type SimpleAuthData = z.infer<typeof simpleAuthSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const authForm = useForm<SimpleAuthData>({
    resolver: zodResolver(simpleAuthSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userType: "borrower",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: SimpleAuthData) => {
      const res = await apiRequest("POST", "/api/simple-auth", data);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome to FinScoreX!",
        description: `Successfully joined as ${user.userType}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Join failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const onAuthSubmit = (data: SimpleAuthData) => {
    authMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900">
                Welcome to <span className="text-primary">FinScoreX</span>
              </h1>
              <p className="text-xl text-neutral-600">
                The intelligent peer-to-peer lending platform that connects borrowers with investors.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Smart Credit Scoring</h3>
                  <p className="text-neutral-600">
                    Advanced algorithms analyze your financial profile for instant credit evaluation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Investment Opportunities</h3>
                  <p className="text-neutral-600">
                    Diversify your portfolio with carefully vetted loan investments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-200 rounded-lg">
                  <Shield className="h-6 w-6 text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Secure & Transparent</h3>
                  <p className="text-neutral-600">
                    Bank-level security with complete transparency throughout the lending process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Join FinScoreX
                </CardTitle>
                <p className="text-neutral-600">
                  Enter your details to get started
                </p>
              </CardHeader>
              <CardContent>
                <Form {...authForm}>
                  <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={authForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John" data-testid="input-firstname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={authForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Doe" data-testid="input-lastname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={authForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I want to</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-usertype">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="borrower">Borrow Money</SelectItem>
                              <SelectItem value="investor">Invest Money</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={authMutation.isPending}
                      data-testid="button-join"
                    >
                      {authMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join FinScoreX"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}