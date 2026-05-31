"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type AppToastContextValue = {
  gymName: string;
  helpEmail: string;
  logoUrl?: string;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

type AppToastProviderProps = {
  children: ReactNode;
  gymName: string;
  helpEmail: string;
  logoUrl?: string;
};

export const AppToastProvider = ({ children, gymName, helpEmail, logoUrl }: AppToastProviderProps) => {
  const value = useMemo(() => ({ gymName, helpEmail, logoUrl }), [gymName, helpEmail, logoUrl]);

  return <AppToastContext.Provider value={value}>{children}</AppToastContext.Provider>;
};

export const useAppToastContext = (): AppToastContextValue => {
  const ctx = useContext(AppToastContext);
  if (!ctx) {
    return {
      gymName: "Gym",
      helpEmail: "",
    };
  }
  return ctx;
};

export const useAppToastConfig = () => useAppToastContext();
