import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App Cloner - Turn Screenshots into Code",
  description: "AI-powered tool that converts app screenshots into full-stack applications. Supports React, React Native, Flutter, and more.",
  keywords: "app cloner, screenshot to code, AI development, React, React Native, Flutter",
  authors: [{ name: "App Cloner Team" }],
  openGraph: {
    title: "App Cloner - Turn Screenshots into Code",
    description: "AI-powered tool that converts app screenshots into full-stack applications.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
        >
          <AuthProvider>
            <OnboardingProvider>
              <AuthenticatedLayout>
                {children}
              </AuthenticatedLayout>
              <Toaster />
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
