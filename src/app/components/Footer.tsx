import { BookOpen, Gem, Lightbulb, User } from "lucide-react";
import { useActivePage } from "./ActivePageContext";
import Link from "next/link";
import { useLoader } from "./LoaderContext";

const Footer = () => {
  const { activePage, setActivePage } = useActivePage();
  const { isProcessing, setIsProcessing, loading, setLoading } = useLoader();
  return (
    <div className="fixed bottom-0 text-white left-0 right-0 bg-[#0b2f33] border-slate-600 flex justify-around items-center py-3 md:hidden z-50">
      <Link href={"/take-quiz"}>
        <button
          disabled={isProcessing || loading}
          onClick={() => setActivePage("take-quiz")}
          className={`flex flex-col items-center w-25 disabled:cursor-not-allowed py-2 rounded-lg ${
            activePage === "take-quiz" ? "bg-[#14545b]" : ""
          }`}
        >
          <Lightbulb size={20} color="yellow" />
          <span className="text-xs mt-1">Quiz</span>
        </button>
      </Link>

      <Link href={"/profile-info"}>
        <button
          disabled={isProcessing || loading}
          onClick={() => setActivePage("profile")}
          className={`flex flex-col items-center disabled:cursor-not-allowed w-25 py-2 rounded-lg ${
            activePage === "profile" ? "bg-[#14545b]" : ""
          }`}
        >
          <User size={20} color="brown" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </Link>

      <Link href={"/about-peruse"}>
        <button
          disabled={isProcessing || loading}
          onClick={() => setActivePage("about-us")}
          className={`flex flex-col items-center disabled:cursor-not-allowed w-25 py-2 rounded-lg ${
            activePage === "about-us" ? "bg-[#14545b]" : ""
          }`}
        >
          <BookOpen size={20} color="green" />
          <span className="text-xs mt-1">About</span>
        </button>
      </Link>
    </div>
  );
};
export default Footer;
