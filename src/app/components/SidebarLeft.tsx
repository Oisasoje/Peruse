"use client";

import { BookOpen, Lightbulb, LogOut } from "lucide-react";
import Link from "next/link";
import { useActivePage } from "./ActivePageContext";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

import { Fredoka } from "next/font/google";
import { GiSwordsEmblem } from "react-icons/gi";

const navItems = [
  {
    name: "TAKE QUIZ",
    path: "/take-quiz",
    icon: <Lightbulb size={35} color="yellow" />,
  },
  {
    name: "POD CLASH",
    path: "/challenge",
    icon: <GiSwordsEmblem size={35} color="violet" />,
  },
  {
    name: "ABOUT US ",
    path: "/about-peruse",
    icon: <BookOpen size={35} color="green" />,
  },
  { name: "LOG OUT", path: "/log-out", icon: <LogOut size={35} color="red" /> },
];

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const SidebarLeft = () => {
  const { activePage, setActivePage } = useActivePage();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <aside className="fixed text-white hidden md:block z-100 top-0 left-0 h-screen w-60 border-r-2 border-slate-600 pl-5 pr-3">
      <h3
        className={`${fredoka.className} text-blue-500 text-3xl font-extrabold mt-6`}
      >
        peruse
      </h3>
      <div className="flex flex-col gap-10 mt-10 h-screen w-full">
        {navItems.map((item) => {
          const { name, path, icon } = item;
          setActivePage(pathname);
          return (
            <Link key={name} href={`${path}`}>
              <button
                onClick={() => setActivePage(`${name}`)}
                className={`flex items-center gap-3 cursor-pointer hover:bg-slate-800   rounded-2xl text-left w-full outline-none ${
                  activePage === name ||
                  pathname === path ||
                  pathname.startsWith(path + "/")
                    ? "border-2 py-1.5 px-4.5 border-green-400 bg-gray-800 text-green-400"
                    : "py-2 px-5"
                }`}
              >
                {icon}
                <span className="font-semibold">{name}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarLeft;
