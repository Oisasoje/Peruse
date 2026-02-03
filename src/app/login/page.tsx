"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Enter password"),
});
type LoginSchema = z.infer<typeof loginSchema>;

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/take-quiz");
      } else {
        setUserChecked(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const handleLogin = async (data: LoginSchema) => {
    const { email, password } = data;
    setLoading(true);
    const t = toast.loading("Logging in...");

    try {
      toast.success("Logged in!", { id: t });
      router.replace("/take-quiz");
    } catch (error: any) {
      toast.error("Login failed!", { id: t });
      const errorCode = error.code;
      if (errorCode === "auth/user-not-found") {
        setError("email", { message: "No account found with this email" });
      } else if (errorCode === "auth/wrong-password") {
        setError("password", { message: "Incorrect password" });
      } else if (errorCode === "auth/invalid-email") {
        setError("email", { message: "Invalid email address" });
      } else {
        console.error(error);
        setError("email", { message: "Something went wrong. Try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    dirtyFields.email &&
    dirtyFields.password &&
    !errors.email &&
    !errors.password;

  if (!hasMounted || !userChecked) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#131f24] overflow-hidden font-body">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">Continue your journey to mastery</p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 ml-1"
              >
                Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors"
                  size={20}
                />
                <input
                  disabled={loading}
                  type="email"
                  id="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className={`w-full bg-black/20 border-2 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none transition-all
                    ${errors.email ? "border-red-500/50 focus:border-red-500" : "border-transparent focus:border-blue-500/50 focus:bg-black/30"}
                  `}
                />
              </div>
              <AnimatePresence>
                {errors.email?.message && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-red-400 text-xs ml-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 ml-1"
              >
                Password
              </label>
              <div className="relative group">
                <KeyRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors"
                  size={20}
                />
                <input
                  disabled={loading}
                  type="password"
                  id="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full bg-black/20 border-2 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none transition-all
                    ${errors.password ? "border-red-500/50 focus:border-red-500" : "border-transparent focus:border-blue-500/50 focus:bg-black/30"}
                  `}
                />
              </div>
              <AnimatePresence>
                {errors.password?.message && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-red-400 text-xs ml-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className={`w-full cursor-pointer py-3.5 rounded-xl font-medium font-display shadow-lg transition-all flex items-center justify-center gap-2
                ${
                  isFormValid
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-900/20"
                    : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {loading ? "Logging in..." : "Log In"}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
