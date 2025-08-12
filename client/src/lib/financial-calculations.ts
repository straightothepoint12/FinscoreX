// Financial calculation utilities for the lending platform

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

export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  termInMonths: number
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termInMonths);
  const totalPayments = monthlyPayment * termInMonths;
  return totalPayments - principal;
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termInMonths: number
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const schedule = [];
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termInMonths);
  
  let remainingBalance = principal;
  
  for (let month = 1; month <= termInMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, remainingBalance)
    });
  }
  
  return schedule;
}

export function calculateROI(
  investedAmount: number,
  currentValue: number,
  timeInMonths: number
): {
  totalReturn: number;
  annualizedReturn: number;
  totalReturnPercentage: number;
} {
  const totalReturn = currentValue - investedAmount;
  const totalReturnPercentage = (totalReturn / investedAmount) * 100;
  const annualizedReturn = Math.pow(currentValue / investedAmount, 12 / timeInMonths) - 1;
  
  return {
    totalReturn,
    annualizedReturn: annualizedReturn * 100,
    totalReturnPercentage
  };
}

export function calculateRiskMetrics(investments: Array<{
  amount: number;
  creditGrade: string;
  actualReturn: number;
}>): {
  diversificationScore: number;
  averageGrade: string;
  riskDistribution: Record<string, number>;
} {
  const gradeWeights = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
  const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  const riskDistribution: Record<string, number> = {};
  let weightedGradeSum = 0;
  
  investments.forEach(inv => {
    const grade = inv.creditGrade;
    if (!riskDistribution[grade]) {
      riskDistribution[grade] = 0;
    }
    riskDistribution[grade] += inv.amount;
    weightedGradeSum += (gradeWeights[grade as keyof typeof gradeWeights] || 5) * inv.amount;
  });
  
  // Convert to percentages
  Object.keys(riskDistribution).forEach(grade => {
    riskDistribution[grade] = (riskDistribution[grade] / totalAmount) * 100;
  });
  
  // Calculate diversification score (higher is better, max 100)
  const uniqueGrades = Object.keys(riskDistribution).length;
  const maxConcentration = Math.max(...Object.values(riskDistribution));
  const diversificationScore = Math.min(100, (uniqueGrades * 20) + (100 - maxConcentration));
  
  // Calculate average grade
  const avgGradeValue = weightedGradeSum / totalAmount;
  const averageGrade = Object.entries(gradeWeights)
    .reduce((closest, [grade, value]) => 
      Math.abs(value - avgGradeValue) < Math.abs(gradeWeights[closest as keyof typeof gradeWeights] - avgGradeValue) 
        ? grade : closest, 'E'
    );
  
  return {
    diversificationScore,
    averageGrade,
    riskDistribution
  };
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
