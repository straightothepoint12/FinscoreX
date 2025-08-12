// Vercel Serverless Function Entry Point for FinScoreX
import express from 'express';
import cors from 'cors';

// Import server modules
import { registerRoutes } from '../dist/routes-simple.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Register routes
registerRoutes(app);

// Export for Vercel
export default app;