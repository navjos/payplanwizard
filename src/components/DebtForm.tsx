
import React, { useState, useEffect } from "react";
import { Debt, DebtCalculationResult, RepaymentMethod } from "../types/debt";
import DebtTable from "./DebtTable";
import ResultsModal from "./ResultsModal";
import { calculateDebtRepayment } from "../utils/debtCalculator";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

const DebtForm: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const [isLoading, setIsLoading] = useState(true);
  const [debtsChanged, setDebtsChanged] = useState(false);

  // Fetch user's debts from Supabase
  useEffect(() => {
    const fetchDebts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('debts')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data.length > 0) {
          const formattedDebts: Debt[] = data.map(debt => ({
            id: debt.id,
            creditor: debt.creditor,
            balance: Number(debt.balance),
            apr: Number(debt.apr),
            minimumPayment: Number(debt.minimum_payment),
          }));
          setDebts(formattedDebts);
        }
      } catch (error: any) {
        toast.error(`${t('errorFetchingDebts')} ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDebts();
  }, [user, t]);

  // Auto-save debts when they change
  useEffect(() => {
    // Don't save on initial load or if there are no changes
    if (isLoading || !debtsChanged) return;

    const saveDebtsTimeout = setTimeout(() => {
      saveDebtsToSupabase(debts);
      setDebtsChanged(false);
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(saveDebtsTimeout);
  }, [debts, isLoading, debtsChanged]);

  // Save debts when user is about to navigate away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debtsChanged && user) {
        saveDebtsToSupabase(debts);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [debts, debtsChanged, user]);

  const handleDebtChange = (index: number, field: keyof Debt, value: string) => {
    const newDebts = [...debts];
    if (field === "creditor") {
      newDebts[index].creditor = value;
    } else {
      const numValue = value === "" ? 0 : parseFloat(value);
      if (field === "balance" || field === "apr" || field === "minimumPayment") {
        newDebts[index][field] = numValue;
      }
    }
    setDebts(newDebts);
    setDebtsChanged(true);
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
    setDebtsChanged(true);
  };

  const handleRemoveDebt = (id: string) => {
    if (debts.length === 1) {
      toast.error(t('errorOneDebtRequired'));
      return;
    }
    setDebts(debts.filter((debt) => debt.id !== id));
    setDebtsChanged(true);
  };

  const handleExtraPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setExtraPayment(value);
  };

  const saveDebtsToSupabase = async (debtsToSave: Debt[]) => {
    if (!user) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('debts')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      const { error: insertError } = await supabase
        .from('debts')
        .insert(
          debtsToSave.map(debt => ({
            creditor: debt.creditor,
            balance: debt.balance,
            apr: debt.apr,
            minimum_payment: debt.minimumPayment,
            user_id: user.id
          }))
        );
      
      if (insertError) throw insertError;
      
      // Only show toast for manual saves, not auto-saves
      if (!debtsChanged) {
        toast.success(t('debtsSaved'));
      }
    } catch (error: any) {
      toast.error(`${t('errorSavingDebts')} ${error.message}`);
    }
  };

  const handleCalculate = () => {
    const hasEmptyCreditor = debts.some(debt => !debt.creditor.trim());
    const hasZeroBalance = debts.some(debt => debt.balance <= 0);
    const hasZeroPayment = debts.some(debt => debt.minimumPayment <= 0);
    
    if (hasEmptyCreditor) {
      toast.error(t('errorEmptyCreditor'));
      return;
    }
    
    if (hasZeroBalance) {
      toast.error(t('errorZeroBalance'));
      return;
    }
    
    if (hasZeroPayment) {
      toast.error(t('errorZeroPayment'));
      return;
    }
    
    saveDebtsToSupabase(debts);
    
    const calculationResults = calculateDebtRepayment(
      debts,
      repaymentMethod,
      extraPayment
    );
    
    setResults(calculationResults);
    setShowResults(true);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-10 py-8">
      <section className="animate-fade-in space-y-4" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-medium">{t('step1Title')}</h2>
        <DebtTable
          debts={debts}
          onDebtChange={handleDebtChange}
          onRemoveDebt={handleRemoveDebt}
          onAddDebt={handleAddDebt}
        />
      </section>

      <section className="animate-fade-in space-y-4" style={{ animationDelay: '200ms' }}>
        <h2 className="text-xl font-medium">{t('step2Title')}</h2>
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
              <h3 className="text-lg font-medium">{t('debtAvalanche')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('avalancheDescription')}
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
              <h3 className="text-lg font-medium">{t('debtSnowball')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('snowballDescription')}
            </p>
          </div>
        </div>
      </section>

      <section className="animate-fade-in space-y-4" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-medium">{t('step3Title')}</h2>
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
          {t('extraPaymentDescription')}
        </p>
      </section>

      <section className="animate-fade-in pt-4" style={{ animationDelay: '400ms' }}>
        <button
          onClick={handleCalculate}
          className="w-full py-4 px-6 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {t('calculateButton')}
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
