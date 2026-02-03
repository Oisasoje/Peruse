import { BookOpen, Lightbulb, LogOut } from "lucide-react";
import Link from "next/link";
import { useActivePage } from "./ActivePageContext";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { GiSwordsEmblem } from "react-icons/gi";

const navItems = [
  {
    name: "TAKE QUIZ",
    path: "/take-quiz",
    icon: <Lightbulb size={24} />,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    name: "POD CLASH",
    path: "/challenge",
    icon: <GiSwordsEmblem size={24} />,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    name: "ABOUT US ",
    path: "/about-peruse",
    icon: <BookOpen size={24} />,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    name: "LOG OUT",
    path: "/log-out",
    icon: <LogOut size={24} />,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
];

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
    <aside className="fixed hidden md:flex flex-col z-50 top-0 left-0 h-screen w-64 border-r border-slate-700/50 bg-[#131f24]/95 backdrop-blur-xl pl-6 pr-4">
      <div className="py-8">
        <h3 className="font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-3xl font-extrabold tracking-tight">
          peruse
        </h3>
      </div>

      <div className="flex flex-col gap-3 mt-4 w-full">
        {navItems.map((item) => {
          const { name, path, icon, color, bg } = item;
          const isActive = pathname === path || pathname.startsWith(path + "/");

          return (
            <Link key={name} href={`${path}`}>
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActivePage(`${name}`);
                  if (item.name === "LOG OUT") {
                    handleLogout();
                  }
                }}
                className={`flex items-center gap-4 cursor-pointer w-full rounded-xl text-left outline-none transition-all duration-200
                  ${
                    isActive
                      ? `py-3 px-4 border border-slate-600 ${bg} ${color} shadow-lg shadow-black/20`
                      : "py-3 px-4 text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }
                `}
              >
                <div
                  className={`${isActive ? color : "text-slate-500 group-hover:text-white"}`}
                >
                  {icon}
                </div>
                <span
                  className={`font-bold text-sm tracking-wide ${isActive ? "text-white" : ""}`}
                >
                  {name}
                </span>
              </motion.button>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto mb-8 px-4">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-4 border border-blue-500/10">
          <p className="text-xs text-blue-300 font-bold mb-1">PRO TIP</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consistency is key. Keep your streak alive to earn rewards!
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;
