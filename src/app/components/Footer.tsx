import { BookOpen, Gem, Lightbulb, User } from "lucide-react";
import { useActivePage } from "./ActivePageContext";
import Link from "next/link";

const Footer = () => {
  const { activePage, setActivePage } = useActivePage();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0b2f33] border-slate-600 flex justify-around items-center py-3 md:hidden z-50">
      <button
        onClick={() => setActivePage("take-quiz")}
        className={`flex flex-col items-center w-25 py-2 rounded-lg ${
          activePage === "take-quiz" ? "bg-[#14545b]" : ""
        }`}
      >
        <Lightbulb size={20} color="yellow" />
        <span className="text-xs mt-1">Quiz</span>
      </button>

      <button
        onClick={() => setActivePage("get-premium")}
        className={`flex flex-col items-center w-25 py-2 rounded-lg ${
          activePage === "get-premium" ? "bg-[#14545b]" : ""
        }`}
      >
        <Gem size={20} color="blue" />
        <span className="text-xs mt-1">Premium</span>
      </button>

      <Link href={"/profile-info"}>
        <button
          onClick={() => setActivePage("profile")}
          className={`flex flex-col items-center w-25 py-2 rounded-lg ${
            activePage === "profile" ? "bg-[#14545b]" : ""
          }`}
        >
          <User size={20} color="brown" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </Link>

      <button
        onClick={() => setActivePage("about-us")}
        className={`flex flex-col items-center w-25 py-2 rounded-lg ${
          activePage === "about-us" ? "bg-[#14545b]" : ""
        }`}
      >
        <BookOpen size={20} color="green" />
        <span className="text-xs mt-1">About</span>
      </button>
    </div>
  );
};
export default Footer;
