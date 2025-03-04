
import React, { useState } from "react";
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
  const [activeCell, setActiveCell] = useState<{index: number, field: keyof Debt} | null>(null);
  
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-sm border border-border bg-white animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="text-left">
              <th className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-foreground tracking-wider">
                {t('creditor')}
              </th>
              <th className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-foreground tracking-wider">
                {t('balance')}
              </th>
              <th className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-foreground tracking-wider">
                {t('apr')}
              </th>
              <th className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-foreground tracking-wider">
                {t('minimumPayment')}
              </th>
              <th className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-foreground tracking-wider w-8 sm:w-12"></th>
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
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <input
                    type="text"
                    value={debt.creditor}
                    onChange={(e) => onDebtChange(index, "creditor", e.target.value)}
                    onFocus={() => setActiveCell({index, field: "creditor"})}
                    onBlur={() => setActiveCell(null)}
                    className={cn(
                      "w-full bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition text-sm sm:text-base",
                      activeCell?.index === index && activeCell?.field === "creditor" && "border-b-2 border-[#b933ad]"
                    )}
                    placeholder={t('creditorPlaceholder')}
                  />
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 relative">
                  <span className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign size={12} className="sm:h-4 sm:w-4" />
                  </span>
                  <input
                    type="number"
                    value={debt.balance || ""}
                    onChange={(e) => onDebtChange(index, "balance", e.target.value)}
                    onFocus={() => setActiveCell({index, field: "balance"})}
                    onBlur={() => setActiveCell(null)}
                    className={cn(
                      "w-full pl-5 sm:pl-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition text-sm sm:text-base",
                      activeCell?.index === index && activeCell?.field === "balance" && "border-b-2 border-[#b933ad]"
                    )}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 relative">
                  <input
                    type="number"
                    value={debt.apr || ""}
                    onChange={(e) => onDebtChange(index, "apr", e.target.value)}
                    onFocus={() => setActiveCell({index, field: "apr"})}
                    onBlur={() => setActiveCell(null)}
                    className={cn(
                      "w-full pr-5 sm:pr-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition text-sm sm:text-base",
                      activeCell?.index === index && activeCell?.field === "apr" && "border-b-2 border-[#b933ad]"
                    )}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span className="absolute right-3 sm:right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Percent size={12} className="sm:h-4 sm:w-4" />
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 relative">
                  <span className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign size={12} className="sm:h-4 sm:w-4" />
                  </span>
                  <input
                    type="number"
                    value={debt.minimumPayment || ""}
                    onChange={(e) => onDebtChange(index, "minimumPayment", e.target.value)}
                    onFocus={() => setActiveCell({index, field: "minimumPayment"})}
                    onBlur={() => setActiveCell(null)}
                    className={cn(
                      "w-full pl-5 sm:pl-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground text-foreground input-transition text-sm sm:text-base",
                      activeCell?.index === index && activeCell?.field === "minimumPayment" && "border-b-2 border-[#b933ad]"
                    )}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="pr-3 sm:pr-6 py-3 sm:py-4 w-8 sm:w-12 text-right">
                  <button
                    onClick={() => onRemoveDebt(debt.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove debt"
                  >
                    <X size={16} className="sm:size-18" />
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
          className="w-full py-2 px-4 bg-white hover:bg-[#b933ad]/10 hover:text-[#b933ad] hover:border-[#b933ad] border border-border rounded-md transition-colors duration-200 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {t('addNewDebt')}
        </button>
      </div>
    </div>
  );
};

export default DebtTable;
