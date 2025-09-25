// app/no-hearts/page.tsx
import { Fredoka } from "next/font/google";
import Link from "next/link";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export default function NoHeartsPage() {
  return (
    <div
      className={`flex flex-col ${fredoka.className} tracking-widest text-white bg-[#131f24] items-center justify-center min-h-screen`}
    >
      <h1 className="text-2xl font-bold mb-4">No Hearts Left ❤️</h1>
      <p className="mb-4">
        You&apos;ve run out of hearts and cannot access questions.
      </p>
      <p className="mb-6">Come back later when you have more hearts!</p>
      <Link
        href="/take-quiz"
        className="text-blue-500 cursor-pointer hover:text-blue-600 hover:underline"
      >
        Return to Home
      </Link>
    </div>
  );
}
