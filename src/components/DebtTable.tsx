
import React from "react";
import { Debt } from "../types/debt";
import { X, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

interface DebtTableProps {
  debts: Debt[];
  onDebtChange: (index: number, field: keyof Debt, value: string) => void;
  onRemoveDebt: (id: string) => void;
  onAddDebt: () => void;
}

const DebtTable: React.FC<DebtTableProps> = ({
  debts,
  onDebtChange,
  onRemoveDebt,
  onAddDebt,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-sm border border-border bg-white animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-medium text-foreground tracking-wider">
                {t('creditor')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-foreground tracking-wider">
                {t('balance')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-foreground tracking-wider">
                {t('apr')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-foreground tracking-wider">
                {t('minimumPayment')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-foreground tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {debts.map((debt, index) => (
              <tr 
                key={debt.id} 
                className={cn(
                  "transition-all duration-300 ease-in-out group",
                  "hover:bg-secondary/30"
                )}
              >
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={debt.creditor}
                    onChange={(e) => onDebtChange(index, "creditor", e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition"
                    placeholder={t('creditorPlaceholder')}
                  />
                </td>
                <td className="px-6 py-4 relative">
                  <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    value={debt.balance || ""}
                    onChange={(e) => onDebtChange(index, "balance", e.target.value)}
                    className="w-full pl-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-6 py-4 relative">
                  <input
                    type="number"
                    value={debt.apr || ""}
                    onChange={(e) => onDebtChange(index, "apr", e.target.value)}
                    className="w-full pr-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Percent size={16} />
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    value={debt.minimumPayment || ""}
                    onChange={(e) => onDebtChange(index, "minimumPayment", e.target.value)}
                    className="w-full pl-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="pr-6 py-4 w-12 text-right">
                  <button
                    onClick={() => onRemoveDebt(debt.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove debt"
                  >
                    <X size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-secondary/30 border-t border-border">
        <button
          onClick={onAddDebt}
          className="w-full py-2 px-4 bg-white hover:bg-secondary/50 border border-border rounded-md transition-colors duration-200 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {t('addNewDebt')}
        </button>
      </div>
    </div>
  );
};

export default DebtTable;
