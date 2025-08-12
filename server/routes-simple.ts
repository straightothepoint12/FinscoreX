import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertLoanSchema, insertInvestmentSchema } from "@shared/schema";

// Credit scoring algorithm
function calculateCreditScore(params: {
  annualIncome: number;
  currentDebt: number;
  employmentYears: number;
  creditHistory: number;
  previousLoans: number;
  homeOwnership: string;
  bankAccount: boolean;
}) {
  const {
    annualIncome,
    currentDebt,
    employmentYears,
    creditHistory,
    previousLoans,
    homeOwnership,
    bankAccount,
  } = params;

  let score = 300; // Base score

  // Income factor (35% weight)
  const debtToIncomeRatio = currentDebt / annualIncome;
  if (debtToIncomeRatio < 0.1) score += 200;
  else if (debtToIncomeRatio < 0.3) score += 150;
  else if (debtToIncomeRatio < 0.5) score += 100;
  else score += 50;

  // Credit history (25% weight)
  score += Math.min(creditHistory * 15, 150);

  // Employment stability (20% weight)
  score += Math.min(employmentYears * 10, 100);

  // Home ownership (10% weight)
  if (homeOwnership === "own") score += 50;
  else if (homeOwnership === "mortgage") score += 30;

  // Bank account (5% weight)
  if (bankAccount) score += 25;

  // Previous loans penalty (5% weight)
  score -= previousLoans * 10;

  return Math.min(Math.max(score, 300), 850);
}

function calculateInterestRate(creditScore: number): number {
  if (creditScore >= 750) return 3.5;
  if (creditScore >= 650) return 6.5;
  if (creditScore >= 550) return 12.5;
  if (creditScore >= 450) return 18.5;
  return 24.9;
}

function calculateMonthlyPayment(principal: number, annualRate: number, termInMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) /
    (Math.pow(1 + monthlyRate, termInMonths) - 1);
  return payment;
}

// Import the authentication middleware
import { isAuthenticated } from "./auth";

export function registerRoutes(app: Express): Server {
  // Setup real authentication with simple auth system
  setupAuth(app);

  // Test route
  app.get("/api/test-auth", (req, res) => {
    res.json({ 
      message: "FinScoreX P2P Platform - Demo Mode",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      mode: "no-auth-demo"
    });
  });

  // Loan routes (requires authentication)
  app.post("/api/loans", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const loanData = insertLoanSchema.parse({
        ...req.body,
        borrowerId: req.user.id,
      });

      // Calculate credit score and interest rate
      const creditScore = calculateCreditScore({
        annualIncome: parseFloat(loanData.annualIncome || "0"),
        currentDebt: parseFloat(loanData.currentDebt || "0"),
        employmentYears: loanData.employmentYears || 0,
        creditHistory: loanData.creditHistory || 0,
        previousLoans: loanData.previousLoans || 0,
        homeOwnership: loanData.homeOwnership || "rent",
        bankAccount: loanData.bankAccount || true,
      });

      const interestRate = calculateInterestRate(creditScore);
      const monthlyPayment = calculateMonthlyPayment(
        parseFloat(loanData.amount),
        interestRate,
        loanData.duration || 12
      );

      // Determine credit grade
      let creditGrade: "A" | "B" | "C" | "D" | "E" = "E";
      if (creditScore >= 750) creditGrade = "A";
      else if (creditScore >= 650) creditGrade = "B";
      else if (creditScore >= 550) creditGrade = "C";
      else if (creditScore >= 450) creditGrade = "D";

      const loan = await storage.createLoan({
        ...loanData,
        creditScore,
        creditGrade,
        interestRate: interestRate.toFixed(2),
        monthlyPayment: monthlyPayment.toFixed(2),
        status: "approved", // Auto-approve for demo
      });

      res.json(loan);
    } catch (error) {
      console.error("Error creating loan:", error);
      res.status(500).json({ message: "Failed to create loan" });
    }
  });

  app.get("/api/loans/my", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const loans = await storage.getUserLoans(req.user.id);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching user loans:", error);
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  app.get("/api/loans/marketplace", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const loans = await storage.getAvailableLoans(limit);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching marketplace loans:", error);
      res.status(500).json({ message: "Failed to fetch marketplace loans" });
    }
  });

  app.get("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error) {
      console.error("Error fetching loan:", error);
      res.status(500).json({ message: "Failed to fetch loan" });
    }
  });

  app.patch("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.updateLoan(req.params.id, req.body);
      res.json(loan);
    } catch (error) {
      console.error("Error updating loan:", error);
      res.status(500).json({ message: "Failed to update loan" });
    }
  });

  app.delete("/api/loans/:id", async (req, res) => {
    try {
      const loanId = req.params.id;
      
      // Check if loan exists
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      // In demo mode, allow deletion
      await storage.deleteLoan(loanId);
      res.json({ message: "Loan deleted successfully" });
    } catch (error) {
      console.error("Error deleting loan:", error);
      res.status(500).json({ message: "Failed to delete loan" });
    }
  });

  // Investment routes (requires authentication)
  app.post("/api/investments", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const investmentData = insertInvestmentSchema.parse({
        ...req.body,
        investorId: req.user.id,
      });

      // Get loan details to calculate expected return
      const loan = await storage.getLoan(investmentData.loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      // Check if loan is available for investment
      if (loan.status !== "approved") {
        return res.status(400).json({ message: "Loan is not available for investment" });
      }

      // Check funding limit
      const requestedAmount = parseFloat(investmentData.amount);
      const remainingAmount = parseFloat(loan.amount) - parseFloat(loan.totalFunded);
      
      if (requestedAmount > remainingAmount) {
        return res.status(400).json({ 
          message: "Investment amount exceeds remaining funding needed",
          remainingAmount: remainingAmount.toString()
        });
      }

      const interestRate = parseFloat(loan.interestRate || "0");
      const expectedReturn = (requestedAmount * (interestRate / 100) * (loan.duration || 12)) / 12;

      const investment = await storage.createInvestment({
        ...investmentData,
        interestRate: loan.interestRate || "0",
        expectedReturn: expectedReturn.toFixed(2),
      });

      res.json(investment);
    } catch (error) {
      console.error("Error creating investment:", error);
      res.status(500).json({ message: "Failed to create investment" });
    }
  });

  app.get("/api/investments/my", isAuthenticated, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const investments = await storage.getUserInvestments(req.user.id);
      res.json(investments);
    } catch (error) {
      console.error("Error fetching user investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Admin routes (demo mode - everyone is admin)
  app.get("/api/admin/metrics", async (req, res) => {
    try {
      const metrics = await storage.getAdminMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch admin metrics" });
    }
  });

  app.get("/api/admin/loans", async (req, res) => {
    try {
      const loans = await storage.getAllLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching admin loans:", error);
      res.status(500).json({ message: "Failed to fetch admin loans" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}