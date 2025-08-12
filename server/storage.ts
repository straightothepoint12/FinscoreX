import {
  users,
  loans,
  investments, 
  payments,
  type User,
  type UpsertUser,
  type CreateUser,
  type Loan,
  type InsertLoan,
  type Investment,
  type InsertInvestment,
  type Payment,
  type InsertPayment,
  type LoanWithDetails,
  type InvestmentWithDetails,
  type UserWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sum, count, avg, sql } from "drizzle-orm";
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: CreateUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserStats(userId: string): Promise<UserWithStats | undefined>;
  // Loan operations
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, updates: Partial<Loan>): Promise<Loan>;
  deleteLoan(id: string): Promise<void>;
  getLoan(id: string): Promise<LoanWithDetails | undefined>;
  getUserLoans(borrowerId: string): Promise<LoanWithDetails[]>;
  getAvailableLoans(limit?: number): Promise<LoanWithDetails[]>;
  getAllLoans(): Promise<LoanWithDetails[]>;
  // Investment operations
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getUserInvestments(investorId: string): Promise<InvestmentWithDetails[]>;
  getLoanInvestments(loanId: string): Promise<Investment[]>;
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getLoanPayments(loanId: string): Promise<Payment[]>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
  // Analytics
  getPlatformMetrics(): Promise<{
    totalLoans: number;
    totalVolume: string;
    defaultRate: string;
    avgReturn: string;
  }>;
  // Admin methods
  getAllUsers(): Promise<User[]>;
  getAllInvestments(): Promise<Investment[]>;
  getAdminMetrics(): Promise<{
    totalLoans: number;
    totalUsers: number;
    totalLoanAmount: number;
    totalInvestmentAmount: number;
    averageCreditScore: number;
  }>;
}
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async createUser(userData: CreateUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  async getUserStats(userId: string): Promise<UserWithStats | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    // Get investment stats
    const investmentStats = await db
      .select({
        totalInvested: sum(investments.amount),
        activeInvestments: count(investments.id),
        totalReturn: sum(investments.actualReturn),
      })
      .from(investments)
      .where(eq(investments.investorId, userId));
    // Get loan stats  
    const loanStats = await db
      .select({
        totalBorrowed: sum(loans.amount),
        activeLoans: count(loans.id),
      })
      .from(loans)
      .where(eq(loans.borrowerId, userId));
    const investmentStat = investmentStats[0];
    const loanStat = loanStats[0];
    return {
      ...user,
      totalInvested: investmentStat.totalInvested || "0",
      activeInvestments: investmentStat.activeInvestments || 0,
      totalReturn: investmentStat.totalReturn || "0",
      avgReturn: investmentStat.totalInvested && parseFloat(investmentStat.totalInvested) > 0
        ? ((parseFloat(investmentStat.totalReturn || "0") / parseFloat(investmentStat.totalInvested)) * 100).toFixed(1)
        : "0",
      totalBorrowed: loanStat.totalBorrowed || "0",
      activeLoans: loanStat.activeLoans || 0,
    };
  }
  // Loan operations
  async createLoan(loanData: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values(loanData).returning();
    return loan;
  }
  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    const [loan] = await db
      .update(loans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(loans.id, id))
      .returning();
    return loan;
  }
  async deleteLoan(id: string): Promise<void> {
    // First delete all related investments
    await db.delete(investments).where(eq(investments.loanId, id));
    // Then delete all related payments
    await db.delete(payments).where(eq(payments.loanId, id));
    // Finally delete the loan
    await db.delete(loans).where(eq(loans.id, id));
  }
  async getLoan(id: string): Promise<LoanWithDetails | undefined> {
    const result = await db
      .select({
        loan: loans,
        borrower: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(loans)
      .innerJoin(users, eq(loans.borrowerId, users.id))
      .where(eq(loans.id, id));
    if (!result.length) return undefined;
    const { loan, borrower } = result[0];
    const loanInvestments = await this.getLoanInvestments(id);
    const totalFunded = loanInvestments
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
      .toString();
    const fundingPercentage = (parseFloat(totalFunded) / parseFloat(loan.amount)) * 100;
    return {
      ...loan,
      borrower,
      investments: loanInvestments,
      totalFunded,
      fundingPercentage,
    };
  }
  async getUserLoans(borrowerId: string): Promise<LoanWithDetails[]> {
    const result = await db
      .select({
        loan: loans,
        borrower: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(loans)
      .innerJoin(users, eq(loans.borrowerId, users.id))
      .where(eq(loans.borrowerId, borrowerId))
      .orderBy(desc(loans.createdAt));
    const loansWithDetails = await Promise.all(
      result.map(async ({ loan, borrower }) => {
        const loanInvestments = await this.getLoanInvestments(loan.id);
        const totalFunded = loanInvestments
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
          .toString();
        const fundingPercentage = (parseFloat(totalFunded) / parseFloat(loan.amount)) * 100;
        return {
          ...loan,
          borrower,
          investments: loanInvestments,
          totalFunded,
          fundingPercentage,
        };
      })
    );
    return loansWithDetails;
  }
  async getAvailableLoans(limit = 20): Promise<LoanWithDetails[]> {
    const result = await db
      .select({
        loan: loans,
        borrower: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(loans)
      .innerJoin(users, eq(loans.borrowerId, users.id))
      .where(and(eq(loans.status, "approved")))
      .orderBy(desc(loans.createdAt))
      .limit(limit);
    const loansWithDetails = await Promise.all(
      result.map(async ({ loan, borrower }) => {
        const loanInvestments = await this.getLoanInvestments(loan.id);
        const totalFunded = loanInvestments
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
          .toString();
        const fundingPercentage = (parseFloat(totalFunded) / parseFloat(loan.amount)) * 100;
        return {
          ...loan,
          borrower,
          investments: loanInvestments,
          totalFunded,
          fundingPercentage,
        };
      })
    );
    return loansWithDetails.filter(loan => loan.fundingPercentage < 100);
  }
  async getAllLoans(): Promise<LoanWithDetails[]> {
    const result = await db
      .select({
        loan: loans,
        borrower: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(loans)
      .innerJoin(users, eq(loans.borrowerId, users.id))
      .orderBy(desc(loans.createdAt));
    const loansWithDetails = await Promise.all(
      result.map(async ({ loan, borrower }) => {
        const loanInvestments = await this.getLoanInvestments(loan.id);
        const totalFunded = loanInvestments
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
          .toString();
        const fundingPercentage = (parseFloat(totalFunded) / parseFloat(loan.amount)) * 100;
        return {
          ...loan,
          borrower,
          investments: loanInvestments,
          totalFunded,
          fundingPercentage,
        };
      })
    );
    return loansWithDetails;
  }
  // Investment operations
  async createInvestment(investmentData: InsertInvestment): Promise<Investment> {
    const [investment] = await db.insert(investments).values(investmentData).returning();
    return investment;
  }
  async getUserInvestments(investorId: string): Promise<InvestmentWithDetails[]> {
    const result = await db
      .select({
        investment: investments,
        loan: {
          amount: loans.amount,
          purpose: loans.purpose,
          duration: loans.duration,
          creditGrade: loans.creditGrade,
          status: loans.status,
        },
        borrower: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(investments)
      .innerJoin(loans, eq(investments.loanId, loans.id))
      .innerJoin(users, eq(loans.borrowerId, users.id))
      .where(eq(investments.investorId, investorId))
      .orderBy(desc(investments.createdAt));
    return result.map(({ investment, loan, borrower }) => ({
      ...investment,
      loan,
      borrower,
    }));
  }
  async getLoanInvestments(loanId: string): Promise<Investment[]> {
    return await db
      .select()
      .from(investments)
      .where(eq(investments.loanId, loanId))
      .orderBy(desc(investments.createdAt));
  }
  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }
  async getLoanPayments(loanId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.loanId, loanId))
      .orderBy(asc(payments.paymentNumber));
  }
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
  // Analytics
  async getPlatformMetrics(): Promise<{
    totalLoans: number;
    totalVolume: string;
    defaultRate: string;
    avgReturn: string;
  }> {
    const [loanMetrics] = await db
      .select({
        totalLoans: count(loans.id),
        totalVolume: sum(loans.amount),
        defaultedLoans: count(sql`case when ${loans.status} = 'defaulted' then 1 end`),
      })
      .from(loans);
    const [investmentMetrics] = await db
      .select({
        avgReturn: avg(sql`(${investments.actualReturn} / ${investments.amount}) * 100`),
      })
      .from(investments)
      .where(sql`${investments.actualReturn} > 0`);
    const defaultRate = loanMetrics.defaultedLoans && loanMetrics.totalLoans
      ? ((loanMetrics.defaultedLoans / loanMetrics.totalLoans) * 100).toFixed(1)
      : "0.0";
    return {
      totalLoans: loanMetrics.totalLoans || 0,
      totalVolume: loanMetrics.totalVolume || "0",
      defaultRate,
      avgReturn: investmentMetrics.avgReturn 
        ? parseFloat(investmentMetrics.avgReturn).toFixed(1)
        : "0.0",
    };
  }
  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  async getAllInvestments(): Promise<Investment[]> {
    return await db.select().from(investments);
  }
  async getAdminMetrics() {
    const allLoans = await this.getAllLoans();
    const allInvestments = await this.getAllInvestments();
    const allUsers = await this.getAllUsers();
    const totalLoanAmount = allLoans.reduce((sum: number, loan: LoanWithDetails) => sum + parseFloat(loan.amount), 0);
    const totalInvestmentAmount = allInvestments.reduce((sum: number, inv: Investment) => sum + parseFloat(inv.amount), 0);
    return {
      totalLoans: allLoans.length,
      totalUsers: allUsers.length,
      totalLoanAmount,
      totalInvestmentAmount,
      averageCreditScore: 650
    };
  }
}
export const storage = new DatabaseStorage();
