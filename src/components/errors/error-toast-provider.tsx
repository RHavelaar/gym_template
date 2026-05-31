"use client";

import { Toaster } from "sonner";
import { AppToastProvider } from "@/components/providers/app-toast-context";

type ErrorToastProviderProps = {
  children: React.ReactNode;
  gymName: string;
  helpEmail: string;
  logoUrl?: string;
};

export const ErrorToastProvider = ({ children, gymName, helpEmail, logoUrl }: ErrorToastProviderProps) => {
  return (
    <AppToastProvider gymName={gymName} helpEmail={helpEmail} logoUrl={logoUrl}>
      {children}
      <Toaster
        position="top-right"
        closeButton
        richColors={false}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "gym-toast",
            error: "gym-toast-error",
            success: "gym-toast-success",
            closeButton: "gym-toast-close",
          },
        }}
      />
    </AppToastProvider>
  );
};
