import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { ActivePageProvider } from "./components/ActivePageContext";

import AuthSync from "./components/AuthSync";
import AppShell from "./components/AppShell";

// ✅ Remove next/head usage — App Router handles head via metadata
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ActivePageProvider>
          <AppShell>
            {children}
            <AuthSync />
          </AppShell>
        </ActivePageProvider>

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
