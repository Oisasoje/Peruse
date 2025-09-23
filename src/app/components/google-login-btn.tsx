import Image from "next/image";
import { motion } from "framer-motion";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: "400" });
const GoogleLoginBtn = () => {
  return (
    <div>
      <motion.button
        // disabled={loading}
        // onClick={handleGoogleSignIn}
        className={`w-full max-w-[280px] border-2 px-4 py-2 relative border-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base rounded-lg ${inter.className} font-medium text-white`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4 }}
      >
        <Image
          className="pointer-events-none"
          src="/assets/google-icon.png"
          width={22}
          height={22}
          alt="Google logo"
        />
        Continue with Google
      </motion.button>

      <div className="flex items-center justify-center gap-3 w-full max-w-[280px]">
        <div className="flex-grow h-px bg-gray-400" />
        <span className="text-sm text-white font-semibold">OR</span>
        <div className="flex-grow h-px bg-gray-400" />
      </div>
    </div>
  );
};
export default GoogleLoginBtn;
