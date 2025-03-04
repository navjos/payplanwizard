
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DebtCalculationResult } from "../types/debt";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { useLanguage } from "../contexts/LanguageContext";

interface ResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: DebtCalculationResult | null;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ open, onOpenChange, results }) => {
  const { t } = useLanguage();
  
  if (!results) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl overflow-hidden glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">{t('debtRepaymentPlan')}</DialogTitle>
          <DialogDescription>
            {t('resultDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pt-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Summary section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg p-6 text-center animate-slide-up" style={{ animationDelay: '0ms' }}>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('timeToDebtFreedom')}
              </div>
              <div className="text-3xl font-bold">
                {results.totalMonthsToDebtFree} {results.totalMonthsToDebtFree === 1 ? t('month') : t('months')}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-6 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('totalInterestPaid')}
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(results.totalInterestPaid)}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-6 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('totalAmountPaid')}
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(results.totalAmountPaid)}
              </div>
            </div>
          </div>

          {/* Debt payoff order table */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-medium mb-4">{t('repaymentOrder')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('order')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('creditor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('payoffLength')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('totalInterestPaid')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('totalPayments')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('paymentSchedule')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {results.debtsInPayoffOrder.map((debt, index) => {
                    const totalPayments = debt.balance + debt.totalInterestPaid;
                    
                    return (
                      <tr key={debt.id} className="transition-colors hover:bg-secondary/20">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {debt.creditor || t('unnamedDebt')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {debt.monthsToPayoff} {debt.monthsToPayoff === 1 ? t('month') : t('months')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(debt.totalInterestPaid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(totalPayments)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-pre-line">
                          {debt.paymentSchedule && debt.paymentSchedule.length > 0 
                            ? debt.paymentSchedule.join("\n") 
                            : `${formatCurrency(debt.minimumPayment)} ${t('payMonthlyUntilPaidOff')}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
