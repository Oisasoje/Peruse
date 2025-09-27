// app/about/page.tsx
"use client";
import Link from "next/link";
import { useActivePage } from "../components/ActivePageContext";

export default function AboutPage() {
  const { setActivePage } = useActivePage();
  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:py-12 sm:px-6 lg:py-16">
      <Link
        href={"/take-quiz"}
        className="underline hidden md:block underline-offset-2 fixed top-3  left-3 text-green-600 cursor-pointer text-lg font-extrabold tracking-widest hover:text-green-700"
        onClick={() => setActivePage("take-quiz")}
      >
        Back To Home
      </Link>
      <div className="max-w-3xl md:mt-0 mx-auto">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-white mb-4 px-2">
            ABOUT PERUSE
          </h1>
          <p className="text-lg sm:text-xl text-amber-500 font-medium px-4">
            The Quiz App you need to make The Bridge the most exciting thing
            after Christmas!
          </p>
        </header>

        {/* Problem Section */}
        <section className="mb-12 sm:mb-16  p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border-2 border-red-200 mx-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            HERE IS WHAT WE'RE ABOUT
          </h2>
          <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-white">
            <p>• Having fun while grinding through The Bridge Resources</p>
            <p>• Sparking excitement and community pride</p>
            <p>• Turning knowledge into a shared adventure</p>
            <p className="font-bold text-white mt-3 sm:mt-4">
              Result? You're never burnt out. You{" "}
              <span className="text-2xl text-blue-500 font-bold ">
                CLOCK-IN
              </span>{" "}
              with renewed vigour!
            </p>
          </div>
        </section>

        {/* Solution Section */}
        <section className="mb-12 sm:mb-16 bg-black text-white p-6 sm:p-8 rounded-xl sm:rounded-2xl mx-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-4 sm:mb-6">
            MEZIE AI: THE SAGE YOU NEED
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                WHAT IT DOES:
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>• Roasts your bad decisions</li>
                <li>• Points out obvious truths you ignore</li>
                <li>• Makes you laugh at your own excuses</li>
                <li>• Pushes you to actually improve</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                WHAT IT IS NOT:
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>• Your cheerleader</li>
                <li>• Your yes-man</li>
                <li>• Here to spare your feelings</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 sm:mb-16 bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg mx-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            HOW THIS REALITY CHECK WORKS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-lg">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-3 sm:mb-4">
                1
              </div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">
                Face Real Dilemmas
              </h3>
              <p className="text-xs sm:text-sm">
                Career, relationships, life choices
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg">
              <div className="text-2xl sm:text-3xl font-black text-green-600 mb-3 sm:mb-4">
                2
              </div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">
                Choose Your Answer
              </h3>
              <p className="text-xs sm:text-sm">Pick what you'd actually do</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-lg">
              <div className="text-2xl sm:text-3xl font-black text-red-600 mb-3 sm:mb-4">
                3
              </div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">
                Get Roasted
              </h3>
              <p className="text-xs sm:text-sm">Brutal truths from Mezie AI</p>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mb-12 sm:mb-16 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-yellow-300 mx-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-4 sm:mb-6 text-center">
            PERUSE'S PHILOSOPHY
          </h2>
          <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-white">
            <p className="">• Kindness without truth is cruelty in disguise</p>
            <p className="">
              • The right insult at the right time can change a life
            </p>
            <p className="">
              • Laughter is the best way to swallow bitter pills
            </p>
            <p className="">• Growth requires occasionally feeling stupid</p>
            <p className="">
              • Partying (with emotional intelligence, of course) in The Bridge!
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center px-2">
          <h2 className="text-2xl sm:text-3xl text-white font-bold mb-4 sm:mb-6">
            READY FOR YOUR REALITY CHECK?
          </h2>
          <Link
            href="/take-quiz"
            className="inline-block bg-blue-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold mb-20 md:mb-0 text-base sm:text-lg hover:bg-blue-700 transition transform hover:scale-105"
          >
            GET ROASTED NOW!
          </Link>
        </section>
      </div>
    </div>
  );
}
