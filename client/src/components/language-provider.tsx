import { ReactNode } from "react";

interface LanguageProviderProps {
  children: ReactNode;
}

// Simple wrapper - language state is now global
export function LanguageProvider({ children }: LanguageProviderProps) {
  return <>{children}</>;
}