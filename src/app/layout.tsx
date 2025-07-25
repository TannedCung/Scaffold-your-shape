import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/contexts/AuthProvider";
import ThemeRegistry from "@/contexts/ThemeRegistry";
import { SnackbarProvider } from "@/contexts/SnackbarProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
