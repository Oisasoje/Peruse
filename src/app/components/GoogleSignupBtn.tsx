import Image from "next/image";
import { motion } from "framer-motion";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: "400" });

const GoogleSignupBtn = () => {
  return (
    <div>
      <motion.button
        // onClick={handleGoogleSignup}
        className={`w-full max-w-[280px] border-2 px-4 py-2 border-amber-300  transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base rounded-lg ${inter.className} font-medium origin-center text-white`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        // disabled={loading}
      >
        <Image
          className="pointer-events-none"
          src="/assets/google-icon.png"
          width={22}
          height={22}
          alt="Google logo"
        />
        Sign up with Google
      </motion.button>
      <div className="flex items-center justify-center gap-3 w-full max-w-[280px]">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="text-sm text-white font-semibold">OR</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>
    </div>
  );
};
export default GoogleSignupBtn;
