import { FaShareSquare } from "react-icons/fa";
import { ProgressBar } from "../prototype-quiz/page";
import { Fredoka, Orbitron } from "next/font/google";
import Image from "next/image";
import { BsFillShareFill } from "react-icons/bs";
import { GiRapidshareArrow } from "react-icons/gi";
import { FaShare } from "react-icons/fa6";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const Share_Screen = () => {
  return (
    <div className="w-full min-h-screen bg-black ">
      <div
        className={`flex z-50 fixed w-full bg-slate-800 justify-between ${orbitron.className} p-4`}
      >
        <h1
          className={` ${fredoka.className}  bg-gradient-to-r from-blue-500 via-blue-300 to-white bg-clip-text text-transparent text-4xl font-extrabold`}
        >
          PERUSE
        </h1>
        <div
          className="flex justify-center hover:opacity-80 cursor-pointer items-center gap-3"
          aria-roledescription="button"
        >
          <span className="text-green-500 font-bold text-lg">
            Share, make your friends sef chop beta roasts
          </span>
          <button className="cursor-pointer">
            <FaShareSquare size={35} color="yellow" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <ProgressBar />
        </div>
      </div>
      <div className="flex min-h-screen pt-7  w-full items-center justify-center">
        <div className="w-xl p-4 shadow-2xl rounded-xl shadow-black   bg-teal-500">
          <div className="flex  gap-6">
            <div className="w-20 ">
              <Image
                src="/assets/perusemascot.png"
                alt="peruse mascot"
                width={200}
                height={200}
                className="w-full object-cover"
              />
            </div>
            <div className="flex items-start mt-4 space-x-2">
              {/* The Speech Bubble */}
              <div className="relative bg-slate-600 text-white p-4 rounded-xl max-w-lg">
                {/* The "tail" of the bubble pointing to the mascot */}
                <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 bg-slate-600"></div>
                {/* The text of the roast */}
                <p className={`relative z-10 tracking-wider `}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Veniam excepturi itaque cupiditate unde iste, earum omnis
                  architecto libero suscipit debitis adipisci quis ratione velit
                  quae dolorem ipsa, dicta optio soluta. Lorem ipsum dolor sit
                  amet consectetur adipisicing elit. Quia consequatur ad facilis
                  veritatis quas quis rerum saepe sequi temporibus mollitia!
                  Minus obcaecati soluta veritatis, quisquam quae dolorum
                  ratione molestiae rem?
                </p>
              </div>
            </div>
          </div>
          <button className="cursor-pointer mx-auto border-3 border-green-500 p-4 rounded-lg shadow-2xl shadow-black flex gap-2  w-fit justify-end mt-5 bg-white">
            <span className=" text-right text-2xl font-bold text-red-500">
              Share with friends sharp sharp.
            </span>
            <FaShare size={45} color="blue" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Share_Screen;
