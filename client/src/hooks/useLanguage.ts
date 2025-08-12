import { useState, useEffect } from "react";

export type Language = "en" | "fr";

const translations = {
  en: {
    // Navigation
    nav: {
      marketplace: "Marketplace",
      loanApplication: "Apply for Loan",
      borrowerDashboard: "My Loans",
      investorDashboard: "My Investments",
      adminDashboard: "Administration",
      profile: "Profile",
      settings: "Settings",
      logout: "Log Out",
      login: "Login",
      register: "Sign Up"
    },
    
    // Landing Page
    landing: {
      hero: {
        title: "Revolutionize your",
        highlight1: "investments",
        highlight2: "loans",
        subtitle: "Peer-to-peer lending platform with advanced algorithmic scoring for your professional portfolio."
      },
      cta: {
        borrow: "Request a Loan",
        invest: "Become Investor",
        test: "Test the Platform",
        stack: "Tech Stack"
      },
      platform: {
        title: "Advanced Technology Platform",
        subtitle: "Portfolio project demonstrating the implementation of credit scoring algorithms and investment marketplace."
      },
      features: {
        scoring: {
          title: "Advanced Credit Scoring",
          desc: "Multi-criteria evaluation algorithm with weightings based on industry standards."
        },
        roi: {
          title: "Optimized ROI", 
          desc: "Return calculations with risk metrics and portfolio diversification."
        },
        security: {
          title: "Maximum Security",
          desc: "Banking security protocols and automatic risk diversification."
        }
      },
      borrower: {
        title: "Borrower Dashboard",
        desc: "Manage your loan applications and track your repayments with our advanced financial analysis tools."
      },
      investor: {
        title: "Investor Dashboard",
        desc: "Maximize your returns with our intelligent marketplace and automatic diversification system."
      },
      demo: {
        title: "Explore this Technical Demo",
        desc: "Portfolio project demonstrating the implementation of a complete fintech platform.",
        test: "Test the Platform",
        stack: "Tech Stack"
      },
      tech: {
        backend: "Backend & Database",
        algorithms: "Financial Algorithms"
      }
    },

    // Home Page
    home: {
      welcome: "Hello",
      messages: {
        borrower: "Manage your loans and funding requests",
        investor: "Discover new investment opportunities", 
        admin: "Administrator dashboard"
      },
      accountType: "Account type",
      quickActions: "Quick Actions",
      quickActionsDesc: "Quickly access main features",
      recentActivity: "Recent Activity",
      recentActivityDesc: "Your latest transactions and notifications",
      actions: {
        marketplace: "Explore Marketplace",
        loan: "Request a Loan", 
        investments: "Manage Investments"
      }
    },

    // Common
    common: {
      unauthorized: "Unauthorized",
      unauthorizedDesc: "You must be logged in. Redirecting...",
      error: "Error",
      success: "Success",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close"
    }
  },
  
  fr: {
    // Navigation
    nav: {
      marketplace: "Marketplace",
      loanApplication: "Demander un prêt", 
      borrowerDashboard: "Mes prêts",
      investorDashboard: "Mes investissements",
      adminDashboard: "Administration",
      profile: "Profil",
      settings: "Paramètres",
      logout: "Se Déconnecter",
      login: "Connexion",
      register: "S'inscrire"
    },
    
    // Landing Page
    landing: {
      hero: {
        title: "Révolutionnez vos",
        highlight1: "investissements",
        highlight2: "emprunts", 
        subtitle: "Plateforme de prêt peer-to-peer avec scoring algorithmique avancé pour votre portfolio professionnel."
      },
      cta: {
        borrow: "Demander un Prêt",
        invest: "Devenir Investisseur",
        test: "Tester la Plateforme",
        stack: "Stack Technique"
      },
      platform: {
        title: "Plateforme Technologique Avancée",
        subtitle: "Projet portfolio démontrant l'implémentation d'algorithmes de credit scoring et de marketplace d'investissement."
      },
      features: {
        scoring: {
          title: "Credit Scoring Avancé",
          desc: "Algorithme d'évaluation multi-critères avec pondération basée sur les standards de l'industrie."
        },
        roi: {
          title: "ROI Optimisé",
          desc: "Calculs de rendement avec métriques de risque et diversification de portfolio." 
        },
        security: {
          title: "Sécurité Maximale",
          desc: "Protocoles de sécurité bancaire et diversification automatique des risques."
        }
      },
      borrower: {
        title: "Dashboard Emprunteur", 
        desc: "Gérez vos demandes de prêt et suivez vos remboursements avec nos outils avancés d'analyse financière."
      },
      investor: {
        title: "Dashboard Investisseur",
        desc: "Maximisez vos rendements avec notre marketplace intelligente et notre système de diversification automatique."
      },
      demo: {
        title: "Explorez cette Démo Technique",
        desc: "Projet portfolio démontrant l'implémentation d'une plateforme fintech complète.",
        test: "Tester la Plateforme", 
        stack: "Stack Technique"
      },
      tech: {
        backend: "Backend & Base de Données",
        algorithms: "Algorithmes Financiers"
      }
    },

    // Home Page  
    home: {
      welcome: "Bonjour",
      messages: {
        borrower: "Gérez vos prêts et demandes de financement",
        investor: "Découvrez de nouvelles opportunités d'investissement",
        admin: "Tableau de bord administrateur"
      },
      accountType: "Type de compte",
      quickActions: "Actions Rapides",
      quickActionsDesc: "Accédez rapidement aux fonctionnalités principales",
      recentActivity: "Activité Récente",
      recentActivityDesc: "Vos dernières transactions et notifications", 
      actions: {
        marketplace: "Explorer le Marketplace",
        loan: "Demander un Prêt",
        investments: "Gérer mes Investissements"
      }
    },

    // Common
    common: {
      unauthorized: "Non autorisé", 
      unauthorizedDesc: "Vous devez être connecté. Redirection...",
      error: "Erreur",
      success: "Succès",
      loading: "Chargement...",
      save: "Sauvegarder",
      cancel: "Annuler",
      close: "Fermer"
    }
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    // Start with English by default for international recruiters
    const savedLanguage = localStorage.getItem("lendtech-language");
    return (savedLanguage as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("lendtech-language", language);
  }, [language]);

  const t = (path: string): string => {
    const keys = path.split(".");
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation is missing
        let fallback: any = translations.en;
        for (const fallbackKey of keys) {
          if (fallback && typeof fallback === "object" && fallbackKey in fallback) {
            fallback = fallback[fallbackKey];
          } else {
            return path; // Return the path as last resort
          }
        }
        return typeof fallback === "string" ? fallback : path;
      }
    }
    
    return typeof current === "string" ? current : path;
  };

  return {
    language,
    setLanguage,
    t
  };
}