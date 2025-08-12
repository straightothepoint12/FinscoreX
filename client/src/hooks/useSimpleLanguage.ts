import { useState } from "react";

type Language = "fr" | "en";

const translations = {
  fr: {
    // Navigation
    "nav.marketplace": "Marketplace",
    "nav.loan-application": "Demander un prêt",
    "nav.borrower-dashboard": "Mes prêts",
    "nav.investor-dashboard": "Mes investissements", 
    "nav.admin-dashboard": "Administration",
    "nav.profile": "Profil",
    "nav.settings": "Paramètres",
    "nav.logout": "Se Déconnecter",
    "nav.login": "Connexion",
    "nav.register": "S'inscrire",
    
    // Landing page
    "landing.hero.title": "Révolutionnez vos",
    "landing.hero.highlight1": "investissements",
    "landing.hero.highlight2": "emprunts",
    "landing.hero.subtitle": "Plateforme de prêt peer-to-peer avec scoring algorithmique avancé pour votre portfolio professionnel.",
    "landing.cta.borrow": "Demander un Prêt",
    "landing.cta.invest": "Devenir Investisseur",
    "landing.platform.title": "Plateforme Technologique Avancée",
    "landing.platform.subtitle": "Projet d'étude démontrant l'implémentation d'algorithmes de credit scoring et de marketplace d'investissement.",
    "landing.features.scoring.title": "Credit Scoring Avancé",
    "landing.features.scoring.desc": "Algorithme d'évaluation multi-critères avec pondération basée sur les standards de l'industrie.",
    "landing.features.roi.title": "ROI Optimisé",
    "landing.features.roi.desc": "Calculs de rendement avec métriques de risque et diversification de portfolio.",
    "landing.features.security.title": "Sécurité Maximale",
    "landing.features.security.desc": "Protocoles de sécurité bancaire et diversification automatique des risques.",
    "landing.borrower.title": "Dashboard Emprunteur",
    "landing.borrower.desc": "Gérez vos demandes de prêt et suivez vos remboursements avec nos outils avancés d'analyse financière.",
    "landing.investor.title": "Dashboard Investisseur", 
    "landing.investor.desc": "Maximisez vos rendements avec notre marketplace intelligente et notre système de diversification automatique.",
    "landing.cta.title": "Explorez cette Démo Technique",
    "landing.cta.desc": "Projet portfolio démontrant l'implémentation d'une plateforme fintech complète.",
    "landing.cta.test": "Tester la Plateforme",
    "landing.cta.stack": "Stack Technique",
    "landing.tech.backend": "Backend & Base de Données",
    "landing.tech.algorithms": "Algorithmes Financiers",
  },
  en: {
    // Navigation
    "nav.marketplace": "Marketplace",
    "nav.loan-application": "Apply for Loan",
    "nav.borrower-dashboard": "My Loans",
    "nav.investor-dashboard": "My Investments",
    "nav.admin-dashboard": "Administration",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.logout": "Log Out",
    "nav.login": "Login",
    "nav.register": "Sign Up",
    
    // Landing page
    "landing.hero.title": "Revolutionize your",
    "landing.hero.highlight1": "investments",
    "landing.hero.highlight2": "loans",
    "landing.hero.subtitle": "Peer-to-peer lending platform with advanced algorithmic scoring for your professional portfolio.",
    "landing.cta.borrow": "Request a Loan",
    "landing.cta.invest": "Become Investor",
    "landing.platform.title": "Advanced Technology Platform",
    "landing.platform.subtitle": "Study project demonstrating the implementation of credit scoring algorithms and investment marketplace.",
    "landing.features.scoring.title": "Advanced Credit Scoring",
    "landing.features.scoring.desc": "Multi-criteria evaluation algorithm with weightings based on industry standards.",
    "landing.features.roi.title": "Optimized ROI",
    "landing.features.roi.desc": "Return calculations with risk metrics and portfolio diversification.",
    "landing.features.security.title": "Maximum Security",
    "landing.features.security.desc": "Banking security protocols and automatic risk diversification.",
    "landing.borrower.title": "Borrower Dashboard",
    "landing.borrower.desc": "Manage your loan applications and track your repayments with our advanced financial analysis tools.",
    "landing.investor.title": "Investor Dashboard",
    "landing.investor.desc": "Maximize your returns with our intelligent marketplace and automatic diversification system.",
    "landing.cta.title": "Explore this Technical Demo",
    "landing.cta.desc": "Portfolio project demonstrating the implementation of a complete fintech platform.",
    "landing.cta.test": "Test the Platform",
    "landing.cta.stack": "Tech Stack",
    "landing.tech.backend": "Backend & Database",
    "landing.tech.algorithms": "Financial Algorithms",
  }
};

export function useSimpleLanguage() {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return { language, setLanguage, t };
}