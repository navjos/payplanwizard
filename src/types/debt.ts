
export interface Debt {
  id: string;
  creditor: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

export interface DebtWithPayoff extends Debt {
  monthsToPayoff: number;
  totalInterestPaid: number;
  newMonthlyPayment: number;
}

export interface DebtCalculationResult {
  totalMonthsToDebtFree: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  originalTotalMonthly: number;
  debtsInPayoffOrder: DebtWithPayoff[];
}

export type RepaymentMethod = 'avalanche' | 'snowball';
