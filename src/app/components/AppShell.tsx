"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paths where you do NOT want the footer
  const hideFooterOn = ["/", "/login", "/signup", "/no-hearts"];
  const hideSidebarOn = ["/", "/login", "/signup", "/no-hearts"];
  const hideSidebarRightOn = ["/", "/login", "/signup", "/no-hearts"];

  const isQuizRoute = pathname.startsWith("/quiz");

  const showFooter = !hideFooterOn.includes(pathname) && !isQuizRoute;
  const showSidebarOn = !hideSidebarOn.includes(pathname) && !isQuizRoute;
  const showSidebarRightOn =
    !hideSidebarRightOn.includes(pathname) && !isQuizRoute;

  return (
    <>
      {showSidebarOn && <SidebarLeft />}
      {children}
      {showFooter && <Footer />}
      {showSidebarRightOn && <SidebarRight />}
    </>
  );
}
