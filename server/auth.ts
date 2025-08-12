import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { Express, RequestHandler } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Ensure JWT_SECRET exists in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET_FINAL = JWT_SECRET || "finscorex-dev-secret-key-only-for-development";

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Cookie parser middleware for JWT cookies
  app.use(cookieParser());

  // Simple auth endpoint (demo mode) - Stateless JWT for Vercel
  app.post("/api/simple-auth", async (req, res) => {
    try {
      const { firstName, lastName, userType } = req.body;
      
      if (!firstName || !lastName || !userType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create user in database
      const user = await storage.createUser({
        firstName,
        lastName,
        userType,
        profileImageUrl: null,
      });

      // Create JWT token (stateless for Vercel)
      const token = jwt.sign(
        { 
          userId: user.id,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName
        }, 
        JWT_SECRET_FINAL, 
        { expiresIn: "7d" }
      );

      // Set JWT as httpOnly cookie for security
      res.cookie('finscorex_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
      });

      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Register endpoint (disabled in demo mode)
  app.post("/api/register", async (req, res) => {
    res.status(501).json({ message: "Registration disabled in demo mode. Use simple auth instead." });
  });

  // Login endpoint (disabled in demo mode)
  app.post("/api/login", async (req, res) => {
    res.status(501).json({ message: "Login disabled in demo mode. Use simple auth instead." });
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    res.clearCookie("finscorex_token");
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current user endpoint (stateless JWT for Vercel)  
  app.get("/api/auth/user", async (req, res) => {
    const token = req.cookies.finscorex_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify JWT token and get user data
    try {
      const decoded = jwt.verify(token, JWT_SECRET_FINAL) as any;
      
      // Get fresh user data from database
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.finscorex_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify JWT (stateless for Vercel)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_FINAL) as any;
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};