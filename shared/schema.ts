import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  text,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (can be removed if using JWT only)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (demo version - no email/password required)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  userType: varchar("user_type", { enum: ["borrower", "investor", "admin"] }).default("borrower"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan status enum
export const loanStatusEnum = pgEnum("loan_status", [
  "draft",
  "submitted", 
  "under_review",
  "approved",
  "funded",
  "active",
  "completed",
  "defaulted"
]);

// Credit grade enum
export const creditGradeEnum = pgEnum("credit_grade", ["A", "B", "C", "D", "E"]);

// Loans table
export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  borrowerId: varchar("borrower_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  duration: integer("duration").notNull(), // in months
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  creditScore: integer("credit_score"),
  creditGrade: creditGradeEnum("credit_grade"),
  status: loanStatusEnum("status").default("draft"),
  
  // Financial information
  annualIncome: decimal("annual_income", { precision: 12, scale: 2 }),
  employmentYears: integer("employment_years"),
  currentDebt: decimal("current_debt", { precision: 12, scale: 2 }),
  homeOwnership: varchar("home_ownership", { enum: ["rent", "own", "mortgage"] }),
  bankAccount: boolean("bank_account").default(true),
  creditHistory: integer("credit_history"), // years of credit history
  previousLoans: integer("previous_loans").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  fundedAt: timestamp("funded_at"),
});

// Investment status enum  
export const investmentStatusEnum = pgEnum("investment_status", [
  "pending",
  "confirmed", 
  "active",
  "completed",
  "cancelled"
]);

// Investments table
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").references(() => users.id).notNull(),
  loanId: varchar("loan_id").references(() => loans.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 10, scale: 2 }),
  actualReturn: decimal("actual_return", { precision: 10, scale: 2 }).default("0"),
  status: investmentStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "scheduled",
  "pending",
  "completed", 
  "late",
  "missed"
]);

// Payments table for tracking loan repayments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").references(() => loans.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  principalAmount: decimal("principal_amount", { precision: 10, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default("scheduled"),
  paymentNumber: integer("payment_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loansAsBorrower: many(loans, { relationName: "borrower" }),
  investments: many(investments, { relationName: "investor" }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  borrower: one(users, {
    fields: [loans.borrowerId],
    references: [users.id],
    relationName: "borrower"
  }),
  investments: many(investments),
  payments: many(payments),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  investor: one(users, {
    fields: [investments.investorId],
    references: [users.id],
    relationName: "investor"
  }),
  loan: one(loans, {
    fields: [investments.loanId],
    references: [loans.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  loan: one(loans, {
    fields: [payments.loanId],
    references: [loans.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type CreateUser = Omit<UpsertUser, "id" | "createdAt" | "updatedAt">;

export type InsertLoan = typeof loans.$inferInsert;
export type Loan = typeof loans.$inferSelect;

export type InsertInvestment = typeof investments.$inferInsert;
export type Investment = typeof investments.$inferSelect;

export type InsertPayment = typeof payments.$inferInsert;
export type Payment = typeof payments.$inferSelect;

// Validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  creditScore: true,
  creditGrade: true,
  interestRate: true,
  monthlyPayment: true,
  fundedAt: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  interestRate: true,  // Server will set this from loan data
  createdAt: true,
  updatedAt: true,
  expectedReturn: true,
  actualReturn: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Extended types for API responses
export type LoanWithDetails = Loan & {
  borrower: Pick<User, "firstName" | "lastName">;
  investments: Investment[];
  totalFunded: string;
  fundingPercentage: number;
};

export type InvestmentWithDetails = Investment & {
  loan: Pick<Loan, "amount" | "purpose" | "duration" | "creditGrade" | "status">;
  borrower: Pick<User, "firstName" | "lastName">;
};

export type UserWithStats = User & {
  totalInvested?: string;
  totalBorrowed?: string;
  activeLoans?: number;
  activeInvestments?: number;
  totalReturn?: string;
  avgReturn?: string;
};
