
import React from "react";
import DebtForm from "../components/DebtForm";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-medium text-foreground">Debt Payoff Planner</h1>
          <p className="text-muted-foreground mt-1">
            Create a personalized plan to become debt-free
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DebtForm />
      </main>
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Debt Payoff Planner. All calculations are estimates.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
