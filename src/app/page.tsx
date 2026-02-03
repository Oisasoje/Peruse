"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#131f24] text-white overflow-hidden relative font-body">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            peruse
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-6"
        >
          <Link
            href="/login"
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            Log in
          </Link>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-900/20 cursor-pointer transition-all flex items-center gap-2"
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-center min-h-[85vh] gap-12 lg:gap-20">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center md:text-left space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-medium mb-4">
            <Sparkles size={14} />
            <span>The #1 Quiz App for Elite Minds</span>
          </div>

          <h2 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Master The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400">
              Bridge
            </span>
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed">
            Join the top 1% of learners. Peruse isn't just a quiz app—it's a
            gateway to mastering complex topics with style and speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto cursor-pointer  px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 group"
              >
                Start Your Journey
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-[#1e293b]/50 border border-slate-600 hover:bg-slate-800 rounded-2xl font-bold text-lg cursor-pointer text-gray-200 transition-colors"
              >
                I Have an Account
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Image / Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full max-w-lg md:max-w-xl relative group"
        >
          <div className="relative z-10 mb-10 animate-float">
            <div className="relative w-full aspect-square bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl border border-white/5 backdrop-blur-sm p-8 flex items-center justify-center">
              <Image
                src="/assets/bg.svg"
                alt="Peruse Hero"
                width={600}
                height={600}
                className="w-full h-full object-contain drop-shadow-2xl"
                priority
              />
            </div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 bg-[#1e293b] p-4 rounded-xl border border-slate-600 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="font-bold text-lg">A+</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Quiz Score</p>
                  <p className="font-bold text-white">Top 1%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
