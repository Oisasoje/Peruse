"use client";

import Link from "next/link";
import { useActivePage } from "../components/ActivePageContext";
import { Inter, Fredoka } from "next/font/google"; // Matching fonts
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Zap,
  CheckCircle,
  Flame,
  ArrowRight,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "700"] });

export default function AboutPage() {
  const { setActivePage } = useActivePage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className={`min-h-screen relative bg-[#131f24] text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden w-full ${inter.className}`}
    >
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto relative z-10 space-y-12 md:ml-60 lg:mr-80 pb-20 md:pb-0 pt-24 md:pt-0 md:mt-0"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="text-center mb-16">
          <h1
            className={`${fredoka.className} text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 drop-shadow-sm`}
          >
            ABOUT PERUSE
          </h1>
          <p className="text-lg sm:text-xl text-blue-200/80 font-medium max-w-2xl mx-auto leading-relaxed">
            The Quiz App you need to make The Bridge the most exciting thing
            after Christmas!
          </p>
        </motion.header>

        {/* Problem Section */}
        <motion.section
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame size={120} color="red" />
          </div>
          <h2
            className={`${fredoka.className} text-3xl font-bold text-white mb-6 flex items-center gap-3`}
          >
            <AlertCircle className="text-red-400" />
            HERE IS WHAT WE'RE ABOUT
          </h2>
          <div className="space-y-4 text-lg text-gray-300 relative z-10">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Having
              fun while grinding through The Bridge Resources
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />{" "}
              Sparking excitement and community pride
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" /> Turning
              knowledge into a shared adventure
            </p>
            <div className="pt-4 border-t border-white/10 mt-6">
              <p className="font-semibold text-white">
                Result? You're never burnt out. You{" "}
                <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-bold ml-1">
                  CLOCK-IN
                </span>{" "}
                with renewed vigour!
              </p>
            </div>
          </div>
        </motion.section>

        {/* Solution Section */}
        <motion.section
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="backdrop-blur-xl bg-black/40 border border-yellow-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Bot size={200} color="blue" />
          </div>
          <h2
            className={`${fredoka.className} text-3xl font-bold text-yellow-400 mb-8 flex items-center gap-3`}
          >
            <Bot className="text-yellow-400" />
            MEZIE AI: THE SAGE YOU NEED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                <CheckCircle size={20} /> WHAT IT DOES:
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span> Roasts your bad
                  decisions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span> Points out
                  obvious truths you ignore
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span> Makes you laugh
                  at your own excuses
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span> Pushes you to
                  actually improve
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <AlertCircle size={20} /> WHAT IT IS NOT:
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span> Your cheerleader
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span> Your yes-man
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span> Here to spare
                  your feelings
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section variants={itemVariants} className="space-y-8">
          <h2
            className={`${fredoka.className} text-3xl sm:text-4xl font-bold text-center text-white mb-8`}
          >
            HOW THIS REALITY CHECK WORKS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: "Face Real Dilemmas",
                desc: "Career, relationships, life choices",
                color: "blue",
                icon: <AlertCircle className="text-blue-400" size={32} />,
              },
              {
                step: 2,
                title: "Choose Your Answer",
                desc: "Pick what you'd actually do",
                color: "green",
                icon: <CheckCircle className="text-green-400" size={32} />,
              },
              {
                step: 3,
                title: "Get Roasted",
                desc: "Brutal truths from Mezie AI",
                color: "red",
                icon: <Flame className="text-red-400" size={32} />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className={`backdrop-blur-xl bg-white/5 border border-${item.color}-500/30 rounded-2xl p-6 text-center shadow-lg hover:shadow-${item.color}-500/20 transition-all`}
              >
                <div
                  className={`w-16 h-16 rounded-full bg-${item.color}-500/20 flex items-center justify-center mx-auto mb-4 border border-${item.color}-500/30`}
                >
                  {item.icon}
                </div>
                <div
                  className={`text-sm font-bold text-${item.color}-400 mb-2 uppercase tracking-wider`}
                >
                  Step 0{item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Philosophy */}
        <motion.section
          variants={itemVariants}
          className="backdrop-blur-xl bg-gradient-to-br from-amber-900/20 to-black/40 border border-amber-500/30 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full" />
          <h2
            className={`${fredoka.className} text-3xl font-bold text-amber-400 mb-8 relative z-10 flex items-center justify-center gap-3`}
          >
            <Zap className="fill-amber-400" />
            PERUSE'S PHILOSOPHY
          </h2>
          <div className="space-y-4 text-lg text-amber-100/90 relative z-10 max-w-2xl mx-auto">
            <p>Kindness without truth is cruelty in disguise</p>
            <p>The right insult at the right time can change a life</p>
            <p>Laughter is the best way to swallow bitter pills</p>
            <p>Growth requires occasionally feeling stupid</p>
            <p className="font-semibold text-white pt-4">
              Partying (with emotional intelligence, of course) in The Bridge!
            </p>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section variants={itemVariants} className="text-center pb-12">
          <h2
            className={`${fredoka.className} text-3xl text-white font-bold mb-8`}
          >
            READY FOR YOUR REALITY CHECK?
          </h2>
          <Link
            href="/take-quiz"
            onClick={() => setActivePage("take-quiz")}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-full font-bold text-lg text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all hover:scale-105"
          >
            GET ROASTED NOW!
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.section>
      </motion.div>
    </div>
  );
}
