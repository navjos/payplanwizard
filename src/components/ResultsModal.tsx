
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DebtCalculationResult } from "../types/debt";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { useLanguage } from "../contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, Calendar, DollarSign, Percent } from "lucide-react";

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
            <div className="bg-secondary/50 rounded-lg p-6 text-center animate-slide-up border border-border/30 hover:shadow-md transition-all" style={{ animationDelay: '0ms' }}>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-center gap-2">
                <Calendar size={18} />
                {t('timeToDebtFreedom')}
              </div>
              <div className="text-3xl font-bold">
                {results.totalMonthsToDebtFree} {results.totalMonthsToDebtFree === 1 ? t('month') : t('months')}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-6 text-center animate-slide-up border border-border/30 hover:shadow-md transition-all" style={{ animationDelay: '100ms' }}>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-center gap-2">
                <Percent size={18} />
                {t('totalInterestPaid')}
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(results.totalInterestPaid)}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-6 text-center animate-slide-up border border-border/30 hover:shadow-md transition-all" style={{ animationDelay: '200ms' }}>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-center gap-2">
                <DollarSign size={18} />
                {t('totalAmountPaid')}
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(results.totalAmountPaid)}
              </div>
            </div>
          </div>

          {/* Debt payoff order section */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-medium mb-4">{t('repaymentOrder')}</h3>
            <div className="space-y-4">
              {results.debtsInPayoffOrder.map((debt, index) => {
                const totalPayments = debt.balance + debt.totalInterestPaid;
                const isFirst = index === 0;
                const isLast = index === results.debtsInPayoffOrder.length - 1;
                
                return (
                  <div key={debt.id} className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
                    <div className="p-4 sm:p-6 flex flex-col space-y-4">
                      {/* Debt header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-medium">
                            #{index + 1}
                          </Badge>
                          <h4 className="text-lg font-medium">
                            {debt.creditor || t('unnamedDebt')}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="bg-secondary/50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Calendar size={14} />
                            {debt.monthsToPayoff} {debt.monthsToPayoff === 1 ? t('month') : t('months')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Debt details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-secondary/30 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">{t('balance')}</div>
                          <div className="font-medium">{formatCurrency(debt.balance)}</div>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">{t('totalInterestPaid')}</div>
                          <div className="font-medium">{formatCurrency(debt.totalInterestPaid)}</div>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">{t('totalPayments')}</div>
                          <div className="font-medium">{formatCurrency(totalPayments)}</div>
                        </div>
                      </div>
                      
                      {/* Payment schedule */}
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-2">{t('paymentSchedule')}</div>
                        <div className="text-sm bg-secondary/20 p-3 rounded-md whitespace-pre-line">
                          {debt.paymentSchedule && debt.paymentSchedule.length > 0 
                            ? debt.paymentSchedule.join("\n") 
                            : `${formatCurrency(debt.minimumPayment)} ${t('payMonthlyUntilPaidOff')}`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow to next debt */}
                    {!isLast && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="text-muted-foreground h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
