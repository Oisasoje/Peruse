"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paths where you do NOT want the footer
  const hideFooterOn = ["/", "/login", "/signup", "/no-hearts"];

  const showFooter = !hideFooterOn.includes(pathname);

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
}
