import { AppClerkProvider } from "@/components/providers/clerk-provider";
import { ErrorToastProvider } from "@/components/errors/error-toast-provider";

type AppProvidersProps = {
  children: React.ReactNode;
  gymName: string;
  helpEmail: string;
  logoUrl?: string;
  clerkConfig: Parameters<typeof AppClerkProvider>[0]["config"];
};

export const AppProviders = ({ children, gymName, helpEmail, logoUrl, clerkConfig }: AppProvidersProps) => {
  return (
    <AppClerkProvider config={clerkConfig}>
      <ErrorToastProvider gymName={gymName} helpEmail={helpEmail} logoUrl={logoUrl}>
        {children}
      </ErrorToastProvider>
    </AppClerkProvider>
  );
};
