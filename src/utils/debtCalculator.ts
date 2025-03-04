
import { Debt, DebtCalculationResult, DebtWithPayoff, RepaymentMethod } from "../types/debt";
import { formatCurrency } from "./formatters";

const sortDebts = (debts: Debt[], method: RepaymentMethod): Debt[] => {
  return [...debts].sort((a, b) => {
    if (method === 'avalanche') {
      return b.apr - a.apr; // Highest APR first
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
    paymentSchedule: [] as string[],
    monthlyPayments: [] as {month: number, amount: number}[]
  }));
  
  let month = 0;
  let totalInterestPaid = 0;
  let availablePayment = originalTotalMonthly + extraPayment;
  let allPaidOff = false;
  let maxMonth = 0;
  
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
      
      // Track this month's payment
      debt.monthlyPayments.push({
        month,
        amount: payment
      });
      
      if (debt.currentBalance <= 0 && debt.monthsToPayoff === 0) {
        debt.monthsToPayoff = month;
        if (month > maxMonth) {
          maxMonth = month;
        }
      }
    }
    
    if (remainingPayment > 0) {
      for (const debt of workingDebts) {
        if (debt.currentBalance <= 0) continue;
        
        const paymentToApply = Math.min(remainingPayment, debt.currentBalance);
        debt.currentBalance -= paymentToApply;
        remainingPayment -= paymentToApply;
        
        // Update this month's payment
        const paymentEntry = debt.monthlyPayments.find(p => p.month === month);
        if (paymentEntry) {
          paymentEntry.amount += paymentToApply;
        }
        
        if (debt.currentBalance <= 0 && debt.monthsToPayoff === 0) {
          debt.monthsToPayoff = month;
          if (month > maxMonth) {
            maxMonth = month;
          }
        }
        
        if (remainingPayment <= 0) break;
      }
    }
  }
  
  const debtsWithPayoff: DebtWithPayoff[] = workingDebts.map(debt => {
    if (debt.monthsToPayoff === 0 && debt.currentBalance > 0) {
      debt.monthsToPayoff = month;
      if (month > maxMonth) {
        maxMonth = month;
      }
    }
    
    // Generate a clearer payment schedule
    const schedule: string[] = [];
    
    // Group payments by month and amount
    const paymentByAmount: {[key: string]: number[]} = {};
    
    debt.monthlyPayments.forEach(payment => {
      const amountKey = formatCurrency(payment.amount);
      if (!paymentByAmount[amountKey]) {
        paymentByAmount[amountKey] = [];
      }
      paymentByAmount[amountKey].push(payment.month);
    });
    
    // Create schedule entries
    Object.entries(paymentByAmount).forEach(([amount, months]) => {
      if (months.length === 1) {
        schedule.push(`Pay ${amount} in month ${months[0]}.`);
      } else if (months.length === debt.monthsToPayoff) {
        schedule.push(`Pay ${amount} each month until paid off (${debt.monthsToPayoff} months).`);
      } else if (months.length > 1) {
        // Find consecutive ranges
        const ranges: {start: number, end: number}[] = [];
        let currentRange: {start: number, end: number} | null = null;
        
        months.sort((a, b) => a - b).forEach(month => {
          if (!currentRange) {
            currentRange = { start: month, end: month };
          } else if (month === currentRange.end + 1) {
            currentRange.end = month;
          } else {
            ranges.push({...currentRange});
            currentRange = { start: month, end: month };
          }
        });
        
        if (currentRange) {
          ranges.push(currentRange);
        }
        
        ranges.forEach(range => {
          if (range.start === range.end) {
            schedule.push(`Pay ${amount} in month ${range.start}.`);
          } else {
            schedule.push(`Pay ${amount} in months ${range.start}-${range.end}.`);
          }
        });
      }
    });
    
    if (schedule.length === 0) {
      schedule.push(`Pay minimum payment each month until paid off.`);
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
    totalMonthsToDebtFree: maxMonth, // Using the actual max month when the last debt is paid off
    totalInterestPaid,
    totalAmountPaid,
    originalTotalMonthly,
    debtsInPayoffOrder: debtsWithPayoff
  };
};
