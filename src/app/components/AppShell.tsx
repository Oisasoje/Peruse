"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paths where you do NOT want the footer
  const hideFooterOn = ["/", "/login", "/signup", "/no-hearts"];

  const isQuizRoute = pathname.startsWith("/quiz");

  const showFooter = !hideFooterOn.includes(pathname) && !isQuizRoute;

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
}
