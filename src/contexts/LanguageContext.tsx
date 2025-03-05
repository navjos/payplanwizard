
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

const translations: Translations = {
  // App layout translations
  appTitle: {
    en: 'Debt Payoff Planner',
    es: 'Planificador de Pago de Deudas'
  },
  appSubtitle: {
    en: 'Create a personalized plan to become debt-free',
    es: 'Crea un plan personalizado para liberarte de deudas'
  },
  logout: {
    en: 'Logout',
    es: 'Cerrar sesión'
  },
  footer: {
    en: 'All calculations are estimates.',
    es: 'Todos los cálculos son estimaciones.'
  },
  
  // Authentication page translations
  login: {
    en: 'Login',
    es: 'Iniciar Sesión'
  },
  signup: {
    en: 'Sign Up',
    es: 'Registrarse'
  },
  email: {
    en: 'Email',
    es: 'Correo Electrónico'
  },
  password: {
    en: 'Password',
    es: 'Contraseña'
  },
  emailPlaceholder: {
    en: 'you@example.com',
    es: 'tu@ejemplo.com'
  },
  loginButton: {
    en: 'Log in',
    es: 'Iniciar Sesión'
  },
  createAccountButton: {
    en: 'Create account',
    es: 'Crear cuenta'
  },
  loggingIn: {
    en: 'Logging in...',
    es: 'Iniciando sesión...'
  },
  creatingAccount: {
    en: 'Creating account...',
    es: 'Creando cuenta...'
  },
  showPassword: {
    en: 'Show password',
    es: 'Mostrar contraseña'
  },
  hidePassword: {
    en: 'Hide password',
    es: 'Ocultar contraseña'
  },
  invalidEmail: {
    en: 'Please enter a valid email address',
    es: 'Por favor ingresa un correo electrónico válido'
  },
  invalidPassword: {
    en: 'Password must be at least 6 characters',
    es: 'La contraseña debe tener al menos 6 caracteres'
  },
  authDescription: {
    en: 'Log in or create an account to manage and track your debt payoff journey',
    es: 'Inicia sesión o crea una cuenta para administrar y seguir tu proceso de pago de deudas'
  },
  
  // Debt form translations
  step1Title: {
    en: 'Step 1: Enter Your Debts',
    es: 'Paso 1: Ingresa tus Deudas'
  },
  step2Title: {
    en: 'Step 2: Choose Repayment Method',
    es: 'Paso 2: Elige el Método de Pago'
  },
  step3Title: {
    en: 'Step 3: Extra Monthly Payment',
    es: 'Paso 3: Pago Mensual Adicional'
  },
  calculateButton: {
    en: 'Calculate Repayment Plan',
    es: 'Calcular Plan de Pago'
  },
  addNewDebt: {
    en: 'Add New Debt',
    es: 'Agregar Nueva Deuda'
  },
  
  // Debt table translations
  creditor: {
    en: 'Creditor',
    es: 'Acreedor'
  },
  balance: {
    en: 'Balance',
    es: 'Saldo'
  },
  apr: {
    en: 'APR',
    es: 'TAE'
  },
  minimumPayment: {
    en: 'Minimum Payment',
    es: 'Pago Mínimo'
  },
  creditorPlaceholder: {
    en: 'Credit Card, Loan, etc.',
    es: 'Tarjeta de Crédito, Préstamo, etc.'
  },
  
  // Repayment methods
  debtAvalanche: {
    en: 'Debt Avalanche',
    es: 'Avalancha de Deudas'
  },
  debtSnowball: {
    en: 'Debt Snowball',
    es: 'Bola de Nieve de Deudas'
  },
  avalancheDescription: {
    en: 'Pay off highest interest rate debts first to minimize interest paid',
    es: 'Paga primero las deudas con tasas de interés más altas para minimizar los intereses pagados'
  },
  snowballDescription: {
    en: 'Pay off smallest balance debts first for psychological wins',
    es: 'Paga primero las deudas con saldos más pequeños para victorias psicológicas'
  },
  extraPaymentDescription: {
    en: 'Enter any additional amount you can pay monthly beyond the minimum payments',
    es: 'Ingresa cualquier cantidad adicional que puedas pagar mensualmente más allá de los pagos mínimos'
  },
  
  // Results modal translations
  debtRepaymentPlan: {
    en: 'Debt Repayment Plan',
    es: 'Plan de Pago de Deudas'
  },
  resultDescription: {
    en: 'Based on your inputs, here\'s your personalized debt repayment strategy.',
    es: 'Basado en tus datos, aquí está tu estrategia personalizada de pago de deudas.'
  },
  timeToDebtFreedom: {
    en: 'Time to Debt Freedom',
    es: 'Tiempo para Libertad de Deudas'
  },
  totalInterestPaid: {
    en: 'Total Interest Paid',
    es: 'Intereses Totales Pagados'
  },
  totalAmountPaid: {
    en: 'Total Amount Paid',
    es: 'Cantidad Total Pagada'
  },
  month: {
    en: 'month',
    es: 'mes'
  },
  months: {
    en: 'months',
    es: 'meses'
  },
  repaymentOrder: {
    en: 'Repayment Order',
    es: 'Orden de Pago'
  },
  order: {
    en: 'Order',
    es: 'Orden'
  },
  payoffLength: {
    en: 'Payoff Length',
    es: 'Duración del Pago'
  },
  totalPayments: {
    en: 'Total Payments',
    es: 'Pagos Totales'
  },
  paymentSchedule: {
    en: 'Payment Schedule',
    es: 'Calendario de Pagos'
  },
  payMonthlyUntilPaidOff: {
    en: 'Pay each month until paid off.',
    es: 'Pagar cada mes hasta liquidar.'
  },
  unnamedDebt: {
    en: 'Unnamed Debt',
    es: 'Deuda Sin Nombre'
  },
  
  // Validation messages
  errorEmptyCreditor: {
    en: 'Please provide a name for all creditors',
    es: 'Por favor proporciona un nombre para todos los acreedores'
  },
  errorZeroBalance: {
    en: 'All debts must have a balance greater than zero',
    es: 'Todas las deudas deben tener un saldo mayor que cero'
  },
  errorZeroPayment: {
    en: 'All debts must have a minimum payment greater than zero',
    es: 'Todas las deudas deben tener un pago mínimo mayor que cero'
  },
  errorOneDebtRequired: {
    en: 'You must have at least one debt entry',
    es: 'Debes tener al menos una entrada de deuda'
  },
  debtsSaved: {
    en: 'Your debts have been saved',
    es: 'Tus deudas han sido guardadas'
  },
  errorSavingDebts: {
    en: 'Error saving debts:',
    es: 'Error al guardar las deudas:'
  },
  errorFetchingDebts: {
    en: 'Error fetching debts:',
    es: 'Error al obtener las deudas:'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
