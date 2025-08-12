// Credit scoring algorithm implementation
// Based on industry standards with weighted criteria

export interface CreditProfile {
  annualIncome: number;
  currentDebt: number;
  employmentYears: number;
  creditHistory: number; // years
  previousLoans: number;
  homeOwnership: "rent" | "own" | "mortgage";
  bankAccount: boolean;
}

export function calculateCreditScore(profile: CreditProfile): number {
  let score = 300; // Base score
  
  // Income score (35% weight) - max 315 points
  const incomeScore = calculateIncomeScore(profile.annualIncome);
  score += incomeScore * 0.35;
  
  // Debt-to-Income ratio (20% weight) - max 180 points  
  const dtiScore = calculateDTIScore(profile.annualIncome, profile.currentDebt);
  score += dtiScore * 0.20;
  
  // Credit history (25% weight) - max 225 points
  const historyScore = calculateHistoryScore(profile.creditHistory, profile.previousLoans);
  score += historyScore * 0.25;
  
  // Employment stability (10% weight) - max 90 points
  const employmentScore = calculateEmploymentScore(profile.employmentYears);
  score += employmentScore * 0.10;
  
  // Housing situation (5% weight) - max 45 points
  const housingScore = calculateHousingScore(profile.homeOwnership);
  score += housingScore * 0.05;
  
  // Bank account (5% weight) - max 45 points
  const bankScore = profile.bankAccount ? 90 : 0;
  score += bankScore * 0.05;
  
  // Cap the score at 850 (excellent credit)
  return Math.min(850, Math.round(score));
}

function calculateIncomeScore(income: number): number {
  // Higher income = higher score (max 315 points for base calculation)
  if (income >= 100000) return 315;
  if (income >= 75000) return 280;
  if (income >= 50000) return 240;
  if (income >= 35000) return 200;
  if (income >= 25000) return 160;
  if (income >= 15000) return 120;
  return 80;
}

function calculateDTIScore(income: number, debt: number): number {
  if (income <= 0) return 0;
  
  const dtiRatio = (debt * 12) / income; // Convert monthly debt to annual
  
  // Lower DTI = higher score (max 180 points for base calculation)
  if (dtiRatio <= 0.15) return 180;
  if (dtiRatio <= 0.25) return 150;
  if (dtiRatio <= 0.35) return 120;
  if (dtiRatio <= 0.45) return 90;
  if (dtiRatio <= 0.55) return 60;
  return 30;
}

function calculateHistoryScore(creditHistory: number, previousLoans: number): number {
  let historyScore = 0;
  
  // Credit history length bonus (max 150 points)
  if (creditHistory >= 10) historyScore += 150;
  else if (creditHistory >= 7) historyScore += 120;
  else if (creditHistory >= 5) historyScore += 90;
  else if (creditHistory >= 3) historyScore += 60;
  else if (creditHistory >= 1) historyScore += 30;
  
  // Previous loans experience (max 75 points)
  if (previousLoans >= 3) historyScore += 75;
  else if (previousLoans >= 2) historyScore += 50;
  else if (previousLoans >= 1) historyScore += 25;
  
  return Math.min(225, historyScore);
}

function calculateEmploymentScore(employmentYears: number): number {
  // Longer employment = more stability (max 90 points for base calculation)
  if (employmentYears >= 5) return 90;
  if (employmentYears >= 3) return 70;
  if (employmentYears >= 2) return 50;
  if (employmentYears >= 1) return 30;
  return 10;
}

function calculateHousingScore(homeOwnership: string): number {
  // Housing stability indicator (max 45 points for base calculation)
  switch (homeOwnership) {
    case "own": return 45;
    case "mortgage": return 35;
    case "rent": return 20;
    default: return 0;
  }
}

export function calculateInterestRate(creditScore: number): number {
  // Interest rate based on credit score
  // Higher score = lower rate
  if (creditScore >= 750) return 6.5;  // Grade A
  if (creditScore >= 700) return 8.2;  // Grade A
  if (creditScore >= 650) return 10.8; // Grade B
  if (creditScore >= 600) return 13.5; // Grade B
  if (creditScore >= 550) return 16.2; // Grade C
  if (creditScore >= 500) return 19.5; // Grade C
  if (creditScore >= 450) return 22.8; // Grade D
  return 26.5; // Grade E
}

export function getCreditGrade(creditScore: number): "A" | "B" | "C" | "D" | "E" {
  if (creditScore >= 750) return "A";
  if (creditScore >= 650) return "B";
  if (creditScore >= 550) return "C";  
  if (creditScore >= 450) return "D";
  return "E";
}

export function getCreditGradeDescription(grade: string): string {
  switch (grade) {
    case "A": return "Excellent - Très faible risque";
    case "B": return "Bon - Risque modéré";
    case "C": return "Correct - Risque élevé";
    case "D": return "Faible - Risque très élevé";
    case "E": return "Mauvais - Risque critique";
    default: return "Non évalué";
  }
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termInMonths: number
): number {
  if (annualRate === 0) {
    return principal / termInMonths;
  }
  
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) /
    (Math.pow(1 + monthlyRate, termInMonths) - 1);
  
  return payment;
}

export function getRiskFactors(profile: CreditProfile): Array<{
  factor: string;
  risk: "low" | "medium" | "high";
  description: string;
}> {
  const factors = [];
  
  const dtiRatio = profile.currentDebt * 12 / profile.annualIncome;
  
  // Income risk
  if (profile.annualIncome < 25000) {
    factors.push({
      factor: "Revenus faibles",
      risk: "high" as const,
      description: "Revenus inférieurs à 25,000€ par an"
    });
  } else if (profile.annualIncome < 50000) {
    factors.push({
      factor: "Revenus modérés",
      risk: "medium" as const,
      description: "Revenus entre 25,000€ et 50,000€ par an"
    });
  }
  
  // DTI risk
  if (dtiRatio > 0.45) {
    factors.push({
      factor: "Ratio d'endettement élevé",
      risk: "high" as const,
      description: `Ratio dette/revenus de ${(dtiRatio * 100).toFixed(1)}%`
    });
  } else if (dtiRatio > 0.25) {
    factors.push({
      factor: "Ratio d'endettement modéré",
      risk: "medium" as const,
      description: `Ratio dette/revenus de ${(dtiRatio * 100).toFixed(1)}%`
    });
  }
  
  // Credit history risk
  if (profile.creditHistory < 3) {
    factors.push({
      factor: "Historique crédit limité",
      risk: "high" as const,
      description: `Moins de 3 ans d'historique crédit`
    });
  } else if (profile.creditHistory < 7) {
    factors.push({
      factor: "Historique crédit moyen",
      risk: "medium" as const,
      description: `${profile.creditHistory} ans d'historique crédit`
    });
  }
  
  // Employment risk
  if (profile.employmentYears < 2) {
    factors.push({
      factor: "Emploi récent",
      risk: "medium" as const,
      description: `Moins de 2 ans dans l'emploi actuel`
    });
  }
  
  return factors;
}
