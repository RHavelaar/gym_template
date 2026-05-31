import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { BrandFontLoader } from "@/components/layout/brand-font-loader";
import { brandToCssVars } from "@/config";
import { resolveSeo } from "@/lib/brand-settings";
import { resolveHelpEmail } from "@/lib/business-info";
import { getResolvedGymConfig } from "@/lib/gym-config-resolver";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getResolvedGymConfig();
  const seo = resolveSeo(config);

  return {
    title: {
      default: seo.metaTitle,
      template: `%s | ${seo.metaTitle}`,
    },
    description: seo.metaDescription,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
      type: "website",
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
    icons: {
      icon: seo.faviconUrl || undefined,
      apple: seo.appleTouchIconUrl || undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getResolvedGymConfig();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} style={brandToCssVars(config)}>
      <body className="min-h-full antialiased">
        <BrandFontLoader config={config} />
        <AppProviders
          gymName={config.name}
          helpEmail={resolveHelpEmail(config.business)}
          logoUrl={config.logoUrl}
          clerkConfig={config}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
