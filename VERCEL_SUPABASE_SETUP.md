# 🚀 FinScoreX - Déploiement Vercel + Supabase

## Guide de Déploiement Complet

### 📋 Prérequis
- Compte GitHub
- Compte Vercel (gratuit)
- Compte Supabase (gratuit)

## 🗄️ ÉTAPE 1: Configuration Supabase

### 1.1 Créer le Projet
1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez "New Project"
3. Choisissez votre organisation
4. Nom du projet: `finscorex`
5. Mot de passe de base: **NOTEZ-LE BIEN** (ex: `FinScore2024!`)
6. Région: Europe West (francfort) pour la France
7. Cliquez "Create new project"
8. **Attendez 2-3 minutes** que le projet soit prêt

### 1.2 Récupérer l'URL de la Base de Données
1. Dans votre projet Supabase → **Settings** (icône engrenage)
2. Cliquez **Database** dans le menu de gauche
3. Trouvez la section **Connection string**
4. Copiez l'**URI** (commence par `postgresql://postgres:`)
5. **IMPORTANT**: Remplacez `[YOUR-PASSWORD]` par votre mot de passe

Exemple d'URL finale:
```
postgresql://postgres:FinScore2024!@db.abcdefghijk.supabase.co:5432/postgres
```

## 🌐 ÉTAPE 2: Déploiement Vercel

### 2.1 Connecter GitHub à Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez "New Project"
4. Sélectionnez votre repository `finscorex`
5. **NE CLIQUEZ PAS DEPLOY ENCORE**

### 2.2 Configurer les Variables d'Environnement
Avant de déployer, ajoutez ces variables dans Vercel:

1. Cliquez **"Environment Variables"**
2. Ajoutez une par une:

```bash
# Base de données
DATABASE_URL = postgresql://postgres:VOTRE-MOT-DE-PASSE@db.VOTRE-REF.supabase.co:5432/postgres

# Sécurité JWT (générez une clé aléatoire de 64 caractères)
JWT_SECRET = votre-cle-secrete-jwt-64-caracteres-minimum-pour-securite

# Session (générez une clé aléatoire de 64 caractères)  
SESSION_SECRET = votre-cle-secrete-session-64-caracteres-minimum-securite

# Environnement
NODE_ENV = production
```

### 2.3 Déployer
1. Cliquez **"Deploy"**
2. Attendez 2-3 minutes
3. Vercel va construire et déployer votre app

## 🔧 ÉTAPE 3: Initialiser la Base de Données

### 3.1 Première Méthode: Via Supabase UI
1. Dans Supabase → **SQL Editor**
2. Copiez-collez ce script pour créer les tables:

```sql
-- Créer les tables FinScoreX
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255),
  "lastName" VARCHAR(255),
  "profileImageUrl" VARCHAR(255),
  "userType" VARCHAR(50) DEFAULT 'borrower',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "borrowerId" UUID REFERENCES users(id),
  amount VARCHAR(255) NOT NULL,
  duration INTEGER,
  "interestRate" VARCHAR(255),
  "monthlyPayment" VARCHAR(255),
  purpose VARCHAR(255),
  "creditScore" INTEGER,
  "creditGrade" VARCHAR(1),
  status VARCHAR(50) DEFAULT 'submitted',
  "totalFunded" VARCHAR(255) DEFAULT '0',
  "annualIncome" VARCHAR(255),
  "currentDebt" VARCHAR(255),
  "employmentYears" INTEGER,
  "creditHistory" INTEGER,
  "previousLoans" INTEGER,
  "homeOwnership" VARCHAR(50),
  "bankAccount" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "investorId" UUID REFERENCES users(id),
  "loanId" UUID REFERENCES loans(id),
  amount VARCHAR(255) NOT NULL,
  "interestRate" VARCHAR(255),
  "expectedReturn" VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "loanId" UUID REFERENCES loans(id),
  amount VARCHAR(255) NOT NULL,
  "paymentDate" TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'completed',
  type VARCHAR(50) DEFAULT 'monthly',
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

3. Cliquez **"Run"**

### 3.2 Alternative: Via le Terminal (après déploiement)
```bash
# Cloner votre repo en local
git clone https://github.com/votre-username/finscorex
cd finscorex

# Installer les dépendances
npm install

# Créer un fichier .env avec vos variables
# Copier le contenu de .env.example et remplir les valeurs

# Pousser le schéma vers Supabase
npm run db:push
```

## ✅ ÉTAPE 4: Tester le Déploiement

### 4.1 Accéder à votre App
Votre app sera accessible à:
```
https://finscorex-votre-username.vercel.app
```

### 4.2 Tester l'Authentification
1. Allez sur `/auth`
2. Créez un compte avec votre email
3. Connectez-vous
4. Accédez au dashboard

### 4.3 Vérifier la Base de Données
Dans Supabase → **Table Editor**, vous devriez voir:
- Table `users` avec votre compte
- Tables `loans`, `investments`, `payments` (vides au début)

## 🎯 Résultats Attendus

### ✅ Authentification Fonctionnelle
- Inscription/connexion avec email/mot de passe
- Sessions persistantes
- Protection des routes

### ✅ Interface Complète
- Page d'accueil avec marketing
- Dashboard borrower/investor/admin
- Formulaires de demande de prêt
- Marketplace d'investissements

### ✅ Algorithmes de Credit Scoring
- Calcul automatique du score de crédit
- Taux d'intérêt adaptatifs
- Évaluation des risques

## 🔍 Dépannage

### Erreur de Connexion Base de Données
- Vérifiez l'URL DATABASE_URL dans Vercel
- Assurez-vous d'avoir remplacé `[YOUR-PASSWORD]`
- Testez la connexion dans Supabase SQL Editor

### Erreur JWT/Session
- Générez de nouvelles clés secrètes (64+ caractères)
- Redéployez après avoir mis à jour les variables

### Build Failed
- Vérifiez que toutes les dépendances sont installées
- Regardez les logs de build dans Vercel

## 🎉 Félicitations !

Votre plateforme FinScoreX est maintenant déployée et fonctionnelle !

**URL pour vos candidatures**: `https://finscorex-votre-username.vercel.app`

---

## 📧 Support
Si vous rencontrez des problèmes, vérifiez:
1. Les variables d'environnement dans Vercel
2. La connexion Supabase dans le SQL Editor
3. Les logs de déploiement dans Vercel