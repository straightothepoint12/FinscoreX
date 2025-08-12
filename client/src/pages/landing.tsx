import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Calculator, TrendingUp, Shield, FileText, PieChart, Calendar, CheckCircle, Building } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="hero-title">
                Revolutionize your <span className="text-blue-200">investments</span> and <span className="text-blue-200">loans</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed" data-testid="hero-description">
                FinScoreX: Advanced peer-to-peer lending platform with intelligent algorithmic scoring for your professional portfolio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/auth">
                  <Button size="lg" className="bg-white text-primary hover:bg-neutral-100 w-full sm:w-auto" data-testid="cta-borrow">
                    Request a Loan
                  </Button>
                </a>
                <a href="/auth">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto"
                    data-testid="cta-invest"
                  >
                    Become Investor
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative" data-testid="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Modern trading and investment interface" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4" data-testid="platform-title">
              Advanced Technology Platform
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto" data-testid="platform-description">
              Portfolio project demonstrating the implementation of credit scoring algorithms and investment marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300" data-testid="feature-scoring">
              <CardContent className="p-8">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Calculator className="text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Advanced Credit Scoring</h3>
                <p className="text-neutral-600 mb-4">Multi-criteria evaluation algorithm with weightings based on industry standards.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Income</span>
                    <span className="font-medium text-secondary">35%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Debt Ratio</span>
                    <span className="font-medium text-secondary">25%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Credit History</span>
                    <span className="font-medium text-secondary">40%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '40%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300" data-testid="feature-roi">
              <CardContent className="p-8">
                <div className="bg-secondary text-white w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Optimized ROI</h3>
                <p className="text-neutral-600 mb-4">Return calculations with risk metrics and portfolio diversification.</p>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600">Automatic calculations</span>
                    <span className="text-lg font-bold text-secondary">ROI</span>
                  </div>
                  <div className="text-2xl font-bold text-neutral-800 mb-1">12.4%</div>
                  <div className="text-sm text-secondary">Average annual return</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300" data-testid="feature-security">
              <CardContent className="p-8">
                <div className="bg-blue-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Maximum Security</h3>
                <p className="text-neutral-600 mb-4">Banking security protocols and automatic risk diversification.</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-secondary text-sm" />
                    <span className="text-sm text-neutral-600">256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-secondary text-sm" />
                    <span className="text-sm text-neutral-600">PCI DSS compliance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-secondary text-sm" />
                    <span className="text-sm text-neutral-600">Guarantee fund</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6" data-testid="borrower-section-title">
                Borrower Dashboard
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                Manage your loan applications and track your repayments with our advanced financial analysis tools.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="text-primary" />
                  <span className="text-neutral-700">Smart application form</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PieChart className="text-primary" />
                  <span className="text-neutral-700">Real-time credit score</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="text-primary" />
                  <span className="text-neutral-700">Repayment scheduler</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6" data-testid="borrower-dashboard-preview">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-800">My Loan Application</h3>
                  <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-sm font-medium">Under Review</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-800">$25,000</div>
                    <div className="text-sm text-neutral-600">Requested amount</div>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">742</div>
                    <div className="text-sm text-neutral-600">Credit score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl shadow-xl p-6 order-2 lg:order-1" data-testid="investor-dashboard-preview">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Investment Portfolio</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-xl font-bold text-neutral-800">$127,500</div>
                    <div className="text-xs text-neutral-600">Invested</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/10 rounded-lg">
                    <div className="text-xl font-bold text-secondary">$14,325</div>
                    <div className="text-xs text-neutral-600">Gains</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-xl font-bold text-primary">11.2%</div>
                    <div className="text-xs text-neutral-600">ROI</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6" data-testid="investor-section-title">
                Investor Dashboard
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                Maximize your returns with our intelligent marketplace and automatic diversification system.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-primary" />
                  <span className="text-neutral-700">Detailed performance analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PieChart className="text-primary" />
                  <span className="text-neutral-700">Automatic diversification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="text-primary" />
                  <span className="text-neutral-700">Opportunity alerts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6" data-testid="cta-title">
            Explore this Technical Demo
          </h2>
          <p className="text-xl mb-8 text-blue-100" data-testid="cta-description">
            Portfolio project demonstrating the implementation of a complete fintech platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/login">
              <Button size="lg" className="bg-white text-primary hover:bg-neutral-100 w-full sm:w-auto" data-testid="cta-start-now">
                Test the Platform
              </Button>
            </a>
            <a href="#tech-stack">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto"
                data-testid="cta-documentation"
              >
                Tech Stack
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech-stack" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-neutral-800">Backend & Database</h3>
              <div className="space-y-2 text-neutral-600">
                <p>— Node.js with Express.js</p>
                <p>— PostgreSQL with Drizzle ORM</p>
                <p>— OpenID Connect authentication</p>
                <p>— Secure RESTful API</p>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-neutral-800">Financial Algorithms</h3>
              <div className="space-y-2 text-neutral-600">
                <p>— Multi-criteria credit scoring</p>
                <p>— Real-time ROI calculations</p>
                <p>— Automated risk assessment</p>
                <p>— Performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}