import { Debt, DebtCalculationResult, DebtWithPayoff, RepaymentMethod } from "../types/debt";
import { formatCurrency } from "./formatters";

const sortDebts = (debts: Debt[], method: RepaymentMethod): Debt[] => {
  return [...debts].sort((a, b) => {
    if (method === 'avalanche') {
      return b.apr - a.apr;
    } else {
      return a.balance - b.balance;
    }
  });
};

const calculateMonthsToPayoff = (
  balance: number,
  apr: number,
  payment: number
): number => {
  if (payment <= 0 || balance <= 0) return 0;
  
  const monthlyRate = apr / 100 / 12;
  
  if (monthlyRate === 0) {
    return Math.ceil(balance / payment);
  }
  
  if (payment <= balance * monthlyRate) {
    return Infinity;
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

const generatePaymentSchedule = (
  balance: number,
  apr: number,
  monthlyPayment: number,
  months: number
): string[] => {
  if (months <= 0) return [];
  
  const schedule: string[] = [];
  const monthlyInterestRate = apr / 100 / 12;
  let remainingBalance = balance;
  let currentMonth = 1;
  let previousPayment = monthlyPayment;
  let paymentChanges = 0;
  
  while (remainingBalance > 0 && currentMonth <= months) {
    const interest = remainingBalance * monthlyInterestRate;
    let principal = monthlyPayment - interest;
    
    if (principal > remainingBalance) {
      principal = remainingBalance;
      monthlyPayment = principal + interest;
    }
    
    remainingBalance -= principal;
    
    const isLastPayment = remainingBalance <= 0;
    const isPaymentChange = !isLastPayment && Math.abs(previousPayment - monthlyPayment) > 0.01;
    
    if (currentMonth === 1 || isPaymentChange) {
      paymentChanges++;
      const untilMonth = isLastPayment ? currentMonth : null;
      
      if (untilMonth) {
        schedule.push(`Pay ${formatCurrency(monthlyPayment)} at month ${currentMonth} to payoff.`);
      } else {
        const nextPaymentChange = findNextPaymentChange(
          remainingBalance, 
          monthlyInterestRate, 
          monthlyPayment, 
          currentMonth, 
          months
        );
        
        if (nextPaymentChange > currentMonth) {
          schedule.push(`Pay ${formatCurrency(monthlyPayment)} until month ${nextPaymentChange - 1}.`);
          currentMonth = nextPaymentChange - 1;
        } else {
          schedule.push(`Pay ${formatCurrency(monthlyPayment)} at month ${currentMonth}.`);
        }
      }
      
      previousPayment = monthlyPayment;
    }
    
    if (isLastPayment && paymentChanges === 1) {
      schedule.length = 0;
      if (months > 1) {
        schedule.push(`Pay ${formatCurrency(previousPayment)} for ${months - 1} months.`);
        schedule.push(`Pay ${formatCurrency(monthlyPayment)} at month ${months} to payoff.`);
      } else {
        schedule.push(`Pay ${formatCurrency(monthlyPayment)} at month 1 to payoff.`);
      }
      break;
    }
    
    currentMonth++;
  }
  
  return schedule;
};

const findNextPaymentChange = (
  balance: number,
  monthlyInterestRate: number,
  payment: number,
  currentMonth: number,
  totalMonths: number
): number => {
  return totalMonths;
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

  const sortedDebts = sortDebts(debts, method);
  const originalTotalMonthly = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  const workingDebts = sortedDebts.map(debt => ({
    ...debt,
    currentBalance: debt.balance,
    totalInterest: 0,
    monthsToPayoff: 0,
    paymentSchedule: [] as string[]
  }));
  
  let month = 0;
  let totalInterestPaid = 0;
  let availablePayment = originalTotalMonthly + extraPayment;
  let allPaidOff = false;
  
  while (!allPaidOff && month < 1200) {
    month++;
    allPaidOff = true;
    
    for (const debt of workingDebts) {
      if (debt.currentBalance <= 0) continue;
      
      allPaidOff = false;
      
      const monthlyInterestRate = debt.apr / 100 / 12;
      const interest = debt.currentBalance * monthlyInterestRate;
      
      debt.currentBalance += interest;
      debt.totalInterest += interest;
      totalInterestPaid += interest;
    }
    
    let remainingPayment = availablePayment;
    
    for (const debt of workingDebts) {
      if (debt.currentBalance <= 0) continue;
      
      let payment = Math.min(debt.minimumPayment, debt.currentBalance);
      debt.currentBalance -= payment;
      remainingPayment -= payment;
      
      if (debt.currentBalance <= 0 && debt.monthsToPayoff === 0) {
        debt.monthsToPayoff = month;
      }
    }
    
    if (remainingPayment > 0) {
      for (const debt of workingDebts) {
        if (debt.currentBalance <= 0) continue;
        
        const paymentToApply = Math.min(remainingPayment, debt.currentBalance);
        debt.currentBalance -= paymentToApply;
        remainingPayment -= paymentToApply;
        
        if (debt.currentBalance <= 0 && debt.monthsToPayoff === 0) {
          debt.monthsToPayoff = month;
        }
        
        if (remainingPayment <= 0) break;
      }
    }
  }
  
  const debtsWithPayoff: DebtWithPayoff[] = workingDebts.map(debt => {
    if (debt.monthsToPayoff === 0 && debt.currentBalance > 0) {
      debt.monthsToPayoff = month;
    }
    
    const schedule = [`Pay ${formatCurrency(debt.minimumPayment)} minimum each month.`];
    if (debt.monthsToPayoff < month) {
      schedule.push(`Fully paid off in month ${debt.monthsToPayoff}.`);
    }
    
    return {
      id: debt.id,
      creditor: debt.creditor,
      balance: debt.balance,
      apr: debt.apr,
      minimumPayment: debt.minimumPayment,
      monthsToPayoff: debt.monthsToPayoff,
      totalInterestPaid: debt.totalInterest,
      newMonthlyPayment: debt.minimumPayment,
      paymentSchedule: schedule
    };
  });
  
  debtsWithPayoff.sort((a, b) => a.monthsToPayoff - b.monthsToPayoff);
  
  const totalPrincipal = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalAmountPaid = totalPrincipal + totalInterestPaid;
  
  return {
    totalMonthsToDebtFree: month,
    totalInterestPaid,
    totalAmountPaid,
    originalTotalMonthly,
    debtsInPayoffOrder: debtsWithPayoff
  };
};
