# FinScoreX - P2P Lending Platform

A professional peer-to-peer lending platform built for showcasing fintech development skills. Features advanced credit scoring algorithms, real-time investment opportunities, and a complete user management system.

## 🚀 Live Demo

**Deployment Ready**: This project is fully configured for GitHub + Vercel + Supabase deployment.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **TanStack Query** for data fetching
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express
- **JWT Authentication** (simplified demo version)
- **PostgreSQL** with Drizzle ORM
- **Advanced credit scoring algorithms**
- **RESTful API architecture**

### Infrastructure
- **Vercel** for hosting
- **Supabase** for PostgreSQL database
- **GitHub** for version control

## 📋 Features

### Authentication System
- Simplified demo authentication (firstname/lastname only)
- JWT-based session management
- Role-based access control (Borrower/Investor/Admin)
- Protected routes and API endpoints

### Credit Scoring Engine
- Multi-factor risk assessment
- Automatic interest rate calculation
- Grade classification (A-E)
- Payment schedule generation

### User Dashboards
- **Borrower Dashboard**: Loan applications and status tracking
- **Investor Dashboard**: Portfolio management and opportunities
- **Admin Dashboard**: Platform metrics and user management

### Marketplace
- Real-time investment opportunities
- Advanced filtering and search
- Detailed loan information
- One-click investment process

### Financial Calculations
- Monthly payment calculation
- Amortization schedules
- Return on investment projections
- Portfolio diversification metrics

## 🎯 Key Highlights for Recruiters

### Technical Proficiency
- **Full-Stack Development**: Complete CRUD operations with React + Express
- **Database Design**: Normalized PostgreSQL schema with relationships
- **Authentication**: Secure JWT implementation with role-based access
- **TypeScript**: Type-safe development across frontend and backend
- **Modern DevOps**: CI/CD ready with Vercel deployment

### Business Logic
- **Algorithmic Credit Scoring**: Mathematical models for risk assessment
- **Financial Calculations**: Complex interest and payment computations
- **Real-Time Updates**: Live data synchronization across the platform
- **Professional UI/UX**: Clean, responsive design suitable for financial services

### Code Quality
- **Type Safety**: Comprehensive TypeScript implementation
- **Error Handling**: Proper error boundaries and user feedback
- **Performance**: Optimized queries and caching strategies
- **Security**: Input validation, authentication, and data protection

## 🚀 Quick Deployment Guide

### Prerequisites
- Node.js 18+
- Supabase account (free)
- Vercel account (free)
- GitHub repository

### 1. Database Setup (Supabase)
1. Create a new Supabase project
2. Copy the connection string from Settings > Database
3. Replace `[YOUR-PASSWORD]` with your database password

### 2. Environment Variables
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
JWT_SECRET="your-64-character-jwt-secret-key"
SESSION_SECRET="your-64-character-session-secret-key"
NODE_ENV="production"
```

### 3. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### 4. Initialize Database
Run this SQL in Supabase SQL Editor to create tables:
```sql
-- See VERCEL_SUPABASE_SETUP.md for complete schema
```

## 📊 Demo Data

The platform includes realistic demo data:
- 10+ sample loan applications
- Multiple user types (borrowers/investors)
- Realistic credit scores and financial data
- Investment history and portfolio examples

## 🔧 Local Development

```bash
# Clone repository
git clone [your-repo-url]
cd finscorex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Start development server
npm run dev
```

## 📁 Project Structure

```
finscorex/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes-simple.ts   # API routes
│   ├── auth.ts           # JWT authentication
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema and types
├── api/                 # Vercel serverless functions
└── deployment files    # Vercel, Docker configs
```

## 🎯 Demonstration Points

### For Fintech Interviews
- Advanced financial calculations and credit risk modeling
- Regulatory compliance considerations (data privacy, security)
- Real-time transaction processing capabilities
- Scalable architecture for financial services

### For Tech Interviews
- Clean, maintainable TypeScript codebase
- Proper separation of concerns and modular architecture
- Performance optimization with caching and efficient queries
- Comprehensive error handling and user experience

### For Finance Interviews
- Understanding of lending business models
- Risk assessment and portfolio management concepts
- Financial metrics calculation and reporting
- Market dynamics and user behavior modeling

## 📈 Future Enhancements

- Payment processing integration (Stripe/PayPal)
- Advanced analytics and reporting
- Mobile app with React Native
- Machine learning for credit scoring
- Multi-currency support
- Automated loan servicing

## 📧 Contact

This project demonstrates expertise in full-stack development, financial technology, and modern web application architecture. Perfect for showcasing technical skills to fintech, tech, and finance recruiters.

---

**Built with ❤️ for demonstrating professional fintech development capabilities**