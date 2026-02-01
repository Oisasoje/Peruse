"use client";
import React from "react";
import Image from "next/image";
import { Fredoka, Inter } from "next/font/google"; // 1. Import Fonts
import { motion } from "framer-motion"; // 2. Import Framer Motion
import { Swords, Timer } from "lucide-react"; // 3. Import Icons

// 4. Configure Fonts
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

const ChallengePage = () => {
  // 5. Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section
      className={`min-h-screen text-white flex flex-col items-center justify-center bg-[#131f24] py-8 px-4 overflow-hidden relative ${inter.className}`}
    >
      {/* 6. Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* 7. Main Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full z-10 flex flex-col items-center text-center md:ml-60 lg:mr-80" // proper spacing for sidebars
      >
        {/* 8. Header / Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2 mx-auto justify-center w-fit">
            <Timer size={14} /> Coming Soon
          </span>
        </motion.div>

        {/* 9. Hero Card */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group w-full max-w-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 -right-20 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Swords size={200} color="red" />
          </div>

          {/* Image with glow */}
          <div className="relative w-full max-w-md mx-auto aspect-video mb-8 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg shadow-purple-900/40">
            <div className="absolute inset-0 bg-gradient-to-t from-[#131f24] via-transparent to-transparent z-10" />
            <Image
              src="/assets/Arena-img.jpg"
              alt="Arena Image"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Text Content */}
          <h1
            className={`${fredoka.className} text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400`}
          >
            THE ARENA OPENS SOON
          </h1>

          <div className="space-y-4 text-lg text-slate-300 max-w-lg mx-auto leading-relaxed">
            <p>
              <span className="text-white font-bold">10 Pods.</span> One Winner.
            </p>
            <p>
              Three questions stand between your pod and ultimate bragging
              rights. Your pod counts on your{" "}
              <span className="text-purple-400 font-semibold">clarity</span>,
              your <span className="text-pink-400 font-semibold">speed</span>,
              and your <span className="text-red-400 font-semibold">depth</span>
              .
            </p>
            <p className="font-bold text-white pt-2 text-xl">
              Make them count.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
export default ChallengePage;
