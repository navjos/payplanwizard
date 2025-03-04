
import { Debt, DebtCalculationResult, DebtWithPayoff, RepaymentMethod } from "../types/debt";

const sortDebts = (debts: Debt[], method: RepaymentMethod): Debt[] => {
  return [...debts].sort((a, b) => {
    if (method === 'avalanche') {
      return b.apr - a.apr; // Highest interest rate first
    } else {
      return a.balance - b.balance; // Lowest balance first
    }
  });
};

const calculateMonthsToPayoff = (
  balance: number,
  apr: number,
  payment: number
): number => {
  if (payment <= 0 || balance <= 0) return 0;
  
  // Monthly interest rate
  const monthlyRate = apr / 100 / 12;
  
  // If interest rate is 0, simple division
  if (monthlyRate === 0) {
    return Math.ceil(balance / payment);
  }
  
  // Formula for months to pay off a loan with interest
  // M = -ln(1 - (P*r/PMT)) / ln(1 + r)
  // Where:
  // M = number of months
  // P = principal (balance)
  // r = monthly interest rate
  // PMT = monthly payment
  
  // Check if payment is greater than monthly interest
  if (payment <= balance * monthlyRate) {
    return Infinity; // Payment too small to ever pay off
  }
  
  const months = -Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
};

const calculateInterestPaid = (
  balance: number,
  apr: number,
  payment: number,
  months: number
): number => {
  if (months === Infinity || months === 0) return 0;
  
  const totalPaid = payment * months;
  return totalPaid - balance;
};

export const calculateDebtRepayment = (
  debts: Debt[],
  method: RepaymentMethod,
  extraPayment: number
): DebtCalculationResult => {
  if (!debts.length) {
    return {
      totalMonthsToDebtFree: 0,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      originalTotalMonthly: 0,
      debtsInPayoffOrder: []
    };
  }

  // Sort debts according to the selected method
  const sortedDebts = sortDebts(debts, method);
  const originalTotalMonthly = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  let remainingDebts = [...sortedDebts];
  const debtsWithPayoff: DebtWithPayoff[] = [];
  
  let totalMonths = 0;
  let totalInterestPaid = 0;
  let runningExtraPayment = extraPayment;
  
  // Calculate payoff for each debt in sequence
  while (remainingDebts.length > 0) {
    const currentDebt = remainingDebts[0];
    
    // Current payment is minimum payment plus any extra and snowball amounts
    const currentPayment = currentDebt.minimumPayment + runningExtraPayment;
    
    // Calculate months to payoff and interest for current debt
    const monthsToPayoff = calculateMonthsToPayoff(
      currentDebt.balance,
      currentDebt.apr,
      currentPayment
    );
    
    const interestPaid = calculateInterestPaid(
      currentDebt.balance,
      currentDebt.apr,
      currentPayment,
      monthsToPayoff
    );
    
    // Add to result
    debtsWithPayoff.push({
      ...currentDebt,
      monthsToPayoff,
      totalInterestPaid: interestPaid,
      newMonthlyPayment: currentPayment
    });
    
    // Update totals
    totalInterestPaid += interestPaid;
    
    // Update max months if this debt takes longer
    totalMonths = Math.max(totalMonths, monthsToPayoff);
    
    // Remove this debt from remaining debts
    remainingDebts = remainingDebts.slice(1);
    
    // Add this debt's payment to the snowball for next debt
    runningExtraPayment += currentDebt.minimumPayment;
  }
  
  // Calculate total amount paid
  const totalAmountPaid = debts.reduce((sum, debt) => sum + debt.balance, 0) + totalInterestPaid;
  
  return {
    totalMonthsToDebtFree: totalMonths,
    totalInterestPaid,
    totalAmountPaid,
    originalTotalMonthly,
    debtsInPayoffOrder: debtsWithPayoff
  };
};
