import { db } from "./db";
import { users, loans, investments } from "@shared/schema";

export async function seedDemoData() {
  try {
    console.log("Seeding demo data...");
    
    // Create demo users
    const demoUsers = await db.insert(users).values([
      {
        firstName: "Antoine",
        lastName: "Martin", 
        userType: "borrower"
      },
      {
        firstName: "Sophie",
        lastName: "Dubois",
        userType: "investor"
      },
      {
        firstName: "Lucas", 
        lastName: "Bernard",
        userType: "investor"
      }
    ]).returning();

    const [borrower, investor1, investor2] = demoUsers;

    // Create demo loans
    const demoLoans = await db.insert(loans).values([
      {
        borrowerId: borrower.id,
        amount: "25000.00",
        purpose: "Business expansion for my restaurant",
        duration: 24,
        interestRate: "8.5",
        monthlyPayment: "1145.00",
        creditScore: 720,
        creditGrade: "B",
        status: "approved",
        annualIncome: "85000.00",
        employmentYears: 5,
        existingDebt: "15000.00"
      },
      {
        borrowerId: borrower.id,
        amount: "15000.00", 
        purpose: "Home renovation project",
        duration: 18,
        interestRate: "7.2",
        monthlyPayment: "920.00",
        creditScore: 750,
        creditGrade: "A",
        status: "approved",
        annualIncome: "85000.00",
        employmentYears: 5,
        existingDebt: "15000.00"
      }
    ]).returning();

    // Create demo investments
    await db.insert(investments).values([
      {
        investorId: investor1.id,
        loanId: demoLoans[0].id,
        amount: "10000.00",
        expectedReturn: "850.00",
        actualReturn: "425.00",
        status: "active"
      },
      {
        investorId: investor2.id,
        loanId: demoLoans[1].id,
        amount: "7500.00", 
        expectedReturn: "540.00",
        actualReturn: "270.00",
        status: "active"
      }
    ]);

    console.log("Demo data seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}