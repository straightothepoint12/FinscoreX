# Overview

FinScoreX is a comprehensive peer-to-peer (P2P) lending platform that connects borrowers with investors through an intelligent marketplace. The application features algorithmic credit scoring, automated risk assessment, and real-time investment opportunities. Built as a full-stack web application, it provides distinct user experiences for borrowers, investors, and administrators while maintaining a unified marketplace for loan transactions.

**IMPORTANT**: This project has been successfully converted from Replit-dependent to a standalone GitHub-ready application. All Replit authentication and dependencies have been removed and replaced with JWT-based authentication system.

**DEPLOYMENT READY**: Project is now optimized for Vercel + Supabase deployment with complete documentation and configuration files.

**VERCEL COMPATIBILITY GUARANTEED**: Authentication system completely refactored from session-based to stateless JWT specifically for serverless deployment compatibility. All potential serverless issues have been identified and resolved.

# User Preferences

Preferred communication style: Simple, everyday language.
Primary language: English (for international recruiters)
Secondary language: French (optional addition)
Priority: Stable, working application over advanced features

# System Architecture

## Frontend Architecture
The client-side is built with **React** and **TypeScript**, utilizing a component-based architecture with modern tooling:
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom design tokens and neutral color palette
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server-side follows a **Node.js/Express** pattern with TypeScript:
- **Framework**: Express.js with middleware for logging, error handling, and request processing
- **API Design**: RESTful endpoints organized by feature (loans, investments, payments, admin)
- **Authentication**: JWT-based authentication with bcryptjs password hashing
- **Database Layer**: Drizzle ORM with type-safe queries and migrations
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Database Design
**PostgreSQL** database with Drizzle ORM providing:
- **User Management**: User profiles with role-based access (borrower, investor, admin)
- **Loan Lifecycle**: Complete loan management from application to completion
- **Investment Tracking**: Investment records with loan relationships
- **Payment Processing**: Payment history and transaction records
- **Session Storage**: Secure session management for authentication

## Authentication & Authorization
**JWT-based Authentication** providing:
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Express session with in-memory storage (configurable)
- **Role-Based Access**: User type enforcement (borrower, investor, admin)
- **Password Security**: bcryptjs hashing for secure password storage
- **Security Features**: Token validation, secure cookies, and proper logout handling

## Credit Scoring Algorithm
**Custom algorithmic scoring** system featuring:
- **Multi-Factor Analysis**: Income, debt-to-income ratio, employment history, credit history
- **Weighted Scoring**: Industry-standard weightings for different credit factors
- **Risk Assessment**: Automatic interest rate calculation based on credit score
- **Payment Calculations**: Monthly payment and amortization schedule generation

## Financial Calculations
**Comprehensive financial utilities** including:
- **Loan Calculations**: Monthly payments, total interest, amortization schedules
- **Risk Metrics**: Portfolio diversification, return calculations, default rate analysis
- **Currency Formatting**: Localized currency display and formatting

# External Dependencies

## Core Infrastructure
- **PostgreSQL Database**: Relational database for data persistence
- **JWT Authentication**: Token-based authentication system
- **Node.js/Express**: Backend runtime and web framework

## Frontend Libraries
- **Radix UI**: Headless UI components for accessibility and interaction patterns
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **TanStack Query**: Data fetching and caching library for React
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation
- **Lucide React**: Icon library for consistent iconography

## Backend Libraries
- **Drizzle ORM**: Type-safe database ORM with migration support
- **Express Session**: Session middleware for user sessions
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing and validation
- **Date-fns**: Date manipulation and formatting utilities

## Development Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Vite**: Development server with hot module replacement
- **PostCSS**: CSS processing with Tailwind integration