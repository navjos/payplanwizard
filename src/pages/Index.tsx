
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
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium text-foreground">{t('appTitle')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('appSubtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLanguage} 
              className="flex items-center gap-2"
              aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
            >
              <Globe size={16} />
              <span>{language === 'en' ? 'ES' : 'EN'}</span>
            </Button>
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
