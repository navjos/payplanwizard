
import React, { useState } from "react";
import { Debt, DebtCalculationResult, RepaymentMethod } from "../types/debt";
import DebtTable from "./DebtTable";
import ResultsModal from "./ResultsModal";
import { calculateDebtRepayment } from "../utils/debtCalculator";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const DebtForm: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: uuidv4(),
      creditor: "",
      balance: 0,
      apr: 0,
      minimumPayment: 0,
    },
  ]);
  
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>("avalanche");
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [results, setResults] = useState<DebtCalculationResult | null>(null);

  const handleDebtChange = (index: number, field: keyof Debt, value: string) => {
    const newDebts = [...debts];
    if (field === "creditor") {
      newDebts[index].creditor = value;
    } else {
      const numValue = value === "" ? 0 : parseFloat(value);
      // Type assertion to fix the TS error
      newDebts[index][field] = numValue as any;
    }
    setDebts(newDebts);
  };

  const handleAddDebt = () => {
    setDebts([
      ...debts,
      {
        id: uuidv4(),
        creditor: "",
        balance: 0,
        apr: 0,
        minimumPayment: 0,
      },
    ]);
  };

  const handleRemoveDebt = (id: string) => {
    if (debts.length === 1) {
      toast.error("You must have at least one debt entry");
      return;
    }
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  const handleExtraPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setExtraPayment(value);
  };

  const handleCalculate = () => {
    // Validate inputs
    const hasEmptyCreditor = debts.some(debt => !debt.creditor.trim());
    const hasZeroBalance = debts.some(debt => debt.balance <= 0);
    const hasZeroPayment = debts.some(debt => debt.minimumPayment <= 0);
    
    if (hasEmptyCreditor) {
      toast.error("Please provide a name for all creditors");
      return;
    }
    
    if (hasZeroBalance) {
      toast.error("All debts must have a balance greater than zero");
      return;
    }
    
    if (hasZeroPayment) {
      toast.error("All debts must have a minimum payment greater than zero");
      return;
    }
    
    // Calculate results
    const calculationResults = calculateDebtRepayment(
      debts,
      repaymentMethod,
      extraPayment
    );
    
    setResults(calculationResults);
    setShowResults(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-10 py-8">
      <section className="animate-fade-in space-y-4" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-medium">Step 1: Enter Your Debts</h2>
        <DebtTable
          debts={debts}
          onDebtChange={handleDebtChange}
          onRemoveDebt={handleRemoveDebt}
          onAddDebt={handleAddDebt}
        />
      </section>

      <section className="animate-fade-in space-y-4" style={{ animationDelay: '200ms' }}>
        <h2 className="text-xl font-medium">Step 2: Choose Repayment Method</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={cn(
              "border rounded-lg p-6 cursor-pointer transition-all duration-200",
              "hover:border-primary/50 hover:bg-secondary/30",
              repaymentMethod === "avalanche"
                ? "border-primary bg-secondary/40 ring-2 ring-primary/20"
                : "border-border"
            )}
            onClick={() => setRepaymentMethod("avalanche")}
          >
            <div className="flex items-center mb-2">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center mr-2",
                  repaymentMethod === "avalanche"
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {repaymentMethod === "avalanche" && (
                  <div className="w-3 h-3 rounded-full bg-primary animate-scale-in"></div>
                )}
              </div>
              <h3 className="text-lg font-medium">Debt Avalanche</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Pay off highest interest rate debts first to minimize interest paid
            </p>
          </div>

          <div
            className={cn(
              "border rounded-lg p-6 cursor-pointer transition-all duration-200",
              "hover:border-primary/50 hover:bg-secondary/30",
              repaymentMethod === "snowball"
                ? "border-primary bg-secondary/40 ring-2 ring-primary/20"
                : "border-border"
            )}
            onClick={() => setRepaymentMethod("snowball")}
          >
            <div className="flex items-center mb-2">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center mr-2",
                  repaymentMethod === "snowball"
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {repaymentMethod === "snowball" && (
                  <div className="w-3 h-3 rounded-full bg-primary animate-scale-in"></div>
                )}
              </div>
              <h3 className="text-lg font-medium">Debt Snowball</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Pay off smallest balance debts first for psychological wins
            </p>
          </div>
        </div>
      </section>

      <section className="animate-fade-in space-y-4" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-medium">Step 3: Extra Monthly Payment</h2>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <DollarSign size={18} />
          </div>
          <input
            type="number"
            value={extraPayment || ""}
            onChange={handleExtraPaymentChange}
            className="w-full pl-10 py-3 pr-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all input-transition"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter any additional amount you can pay monthly beyond the minimum payments
        </p>
      </section>

      <section className="animate-fade-in pt-4" style={{ animationDelay: '400ms' }}>
        <button
          onClick={handleCalculate}
          className="w-full py-4 px-6 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Calculate Repayment Plan
        </button>
      </section>

      <ResultsModal
        open={showResults}
        onOpenChange={setShowResults}
        results={results}
      />
    </div>
  );
};

export default DebtForm;
