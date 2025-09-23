"use client";
import { Inter, Comic_Neue, Fredoka } from "next/font/google";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});
const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const page = () => {
  return (
    <div
      className={`relative bg-cover overflow-hidden max-h-screen w-full ${inter.className}`}
    >
      <div className="pt-2 w-full min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex px-4 w-full justify-center sm:px-6 lg:px-30 mt-3 md:justify-between items-center  sm:mb-4">
          <h3
            className={`${fredoka.className} text-blue-500  text-center self-center text-5xl  sm:text-3xl lg:text-4xl font-extrabold`}
          >
            peruse
          </h3>
          <Link href="/signup">
            <motion.button
              className="bg-blue-500 hover:bg-blue-400 cursor-pointer text-white hidden md:block will-change-transform px-4 sm:px-6 lg:px-10 py-2 sm:pt-1 sm:pb-2 shadow-black font-bold rounded-xl sm:rounded-2xl border-b-4 border-slate-400 text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              GET STARTED
            </motion.button>
          </Link>
        </header>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 w-full flex-1 flex mt-10 md:mt-0 md:items-center justify-center">
          <div className="grid w-full grid-cols-1  lg:grid-cols-2 gap-8 lg:gap-20 max-w-7xl mx-auto">
            {/* Image Section */}
            <div className="w-full h-64 sm:h-80 lg:h-[85vh] rounded-lg  md:shadow-lg  order-1 flex justify-center">
              <Image
                src="/assets/bg.svg"
                alt="background image"
                width={500}
                height={500}
                unoptimized
                className="h-full w-auto pointer-events-none object-contain"
                priority
              />
            </div>

            {/* Text and Buttons Section */}
            <div className="flex gap-6 lg:gap-8 h-full justify-center flex-col order-1 lg:order-2 text-center -mt-40 md:mt-0 items-center lg:text-left">
              <p className="text-2xl text-center  leading-9 sm:leading-8 lg:leading-11 font-extrabold tracking-wider text-[#4B4B4B] max-w-md sm:max-w-lg lg:max-w-full">
                The super fun quiz app you need to complete{" "}
                <span className="text-amber-500 block font-bold text-3xl ">
                  The Bridge!
                </span>
              </p>

              <div className="flex items-center mt-15 md:mt-0 flex-col gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm">
                <Link href="/signup" className="w-full">
                  <motion.button
                    className="bg-blue-500 text-white w-full cursor-pointer hover:bg-blue-400 py-2 sm:py-3 font-bold rounded-xl sm:rounded-2xl will-change-transform border-b-4 border-slate-400"
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    GET STARTED
                  </motion.button>
                </Link>
                <Link href="/login" className="w-full">
                  <motion.button
                    className="w-full py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 font-bold text-green-500 cursor-pointer border-slate-400 hover:bg-amber-50 border-b-4 px-4"
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    I ALREADY HAVE AN ACCOUNT
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
