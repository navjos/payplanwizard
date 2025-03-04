
import React from "react";
import DebtForm from "../components/DebtForm";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { LogOut, Globe } from "lucide-react";

const Index: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-foreground">{t('appTitle')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('appSubtitle')}
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                {user.email}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 self-end sm:self-auto">
            <div className="flex bg-secondary rounded-md">
              <Button 
                variant={language === 'en' ? "secondary" : "ghost"}
                size="sm" 
                onClick={() => setLanguage('en')} 
                className={`rounded-r-none ${language === 'en' ? 'bg-primary/10 font-medium' : ''}`}
                aria-label="Switch to English"
              >
                EN
              </Button>
              <Button 
                variant={language === 'es' ? "secondary" : "ghost"}
                size="sm" 
                onClick={() => setLanguage('es')} 
                className={`rounded-l-none ${language === 'es' ? 'bg-primary/10 font-medium' : ''}`}
                aria-label="Switch to Spanish"
              >
                ES
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center gap-2">
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DebtForm />
      </main>
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {t('appTitle')}. {t('footer')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
