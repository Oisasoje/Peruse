import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { ActivePageProvider } from "./components/ActivePageContext";

import AuthSync from "./components/AuthSync";
import AppShell from "./components/AppShell";
import { LoaderProvider } from "./components/LoaderContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Peruse - Quiz app for the 1%",
  description: "Quiz app for the 1%",
  icons: {
    icon: "/assets/favicon.ico", //
    apple: "/assets/favicon.ico", //
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${inter.variable} antialiased`}
      >
        <LoaderProvider>
          <ActivePageProvider>
            <AppShell>
              {children}
              <AuthSync />
            </AppShell>
          </ActivePageProvider>
        </LoaderProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
