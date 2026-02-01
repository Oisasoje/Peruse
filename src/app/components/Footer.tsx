import { BookOpen, Lightbulb, User } from "lucide-react";
import { useActivePage } from "./ActivePageContext";
import Link from "next/link";
import { useLoader } from "./LoaderContext";
import { GiSwordsEmblem } from "react-icons/gi";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "quiz",
    path: "/take-quiz",
    icon: <Lightbulb size={24} />,
    color: "text-yellow-400",
    activeBg: "bg-yellow-400/20",
    label: "Quiz",
  },
  {
    name: "profile",
    path: "/profile-info",
    icon: <User size={24} />,
    color: "text-blue-400",
    activeBg: "bg-blue-400/20",
    label: "Profile",
  },
  {
    name: "about",
    path: "/about-peruse",
    icon: <BookOpen size={24} />,
    color: "text-green-400",
    activeBg: "bg-green-400/20",
    label: "About",
  },
];

const Footer = () => {
  const { setActivePage } = useActivePage();
  const { isProcessing, loading } = useLoader();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
      <div className="bg-[#131f24]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex justify-between items-center p-2 relative overflow-hidden">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />

        {navItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");

          return (
            <Link key={item.name} href={item.path} className="flex-1">
              <motion.button
                disabled={isProcessing || loading}
                onClick={() => setActivePage(item.name)}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 relative
                                ${isActive ? item.activeBg : "hover:bg-white/5"}
                            `}
              >
                <motion.div
                  animate={
                    isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }
                  }
                  className={`${isActive ? item.color : "text-slate-500"}`}
                >
                  {item.icon}
                </motion.div>
                <span
                  className={`text-[10px] font-bold mt-1 ${isActive ? "text-white" : "text-slate-500"}`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute -bottom-2 w-1 h-1 rounded-full ${item.color.replace("text-", "bg-")} shadow-[0_0_10px_currentColor]`}
                  />
                )}
              </motion.button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
export default Footer;
