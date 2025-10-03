import type { Metadata } from "next";
import "./globals.css";
import { NextAuthProvider } from "@/contexts/AuthProvider";
import ThemeRegistry from "@/contexts/ThemeRegistry";
import { SnackbarProvider } from "@/contexts/SnackbarProvider";

export const metadata: Metadata = {
  title: "Scaffold Your Shape - Track Your Fitness Journey",
  description: "Track your workouts, join fitness challenges and connect with other fitness enthusiasts",
  keywords: ["fitness tracker", "workout", "exercise", "challenge", "fitness community"],
  icons: {
    icon: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.ico" type="image/png" />
      </head>
      <body
        className="antialiased"
      >
        <ThemeRegistry>
          <SnackbarProvider>
            <NextAuthProvider>
              {children}
            </NextAuthProvider>
          </SnackbarProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
