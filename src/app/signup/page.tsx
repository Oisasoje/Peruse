"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createUserDoc } from "../../../lib/firebaseUser";
import { User, Mail, KeyRound, ArrowRight } from "lucide-react"; // Added icons

const signUpSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .max(30, { message: "Username must be at most 30 characters" })
    .refine((val) => !val.startsWith("_") && !val.startsWith("."), {
      message: "Username cannot start with . or _",
    })
    .refine((val) => !val.endsWith("_") && !val.endsWith("."), {
      message: "Username cannot end with . or _",
    })
    .refine((val) => /^[a-zA-Z0-9._\s]+$/.test(val), {
      message:
        "Username can only contain letters, numbers, dots, underscores and spaces",
    })
    .refine((val) => !/\s{2,}/.test(val), {
      message: "Username cannot contain multiple consecutive spaces",
    })
    .transform((val) => val.trim()),

  email: z
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com") || val.endsWith("@yahoo.com"), {
      message: "Email must be gmail.com or yahoo.com",
    }),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
type SignUpSchema = z.infer<typeof signUpSchema>;

const Signup = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/take-quiz"); // replace instead of push
      } else {
        setUserChecked(true); // user not logged in, allow rendering
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
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const handleCreateAccount = async (data: SignUpSchema) => {
    const { username, email, password } = data;

    setLoading(true);
    const t = toast.loading("Creating account...");

    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Add displayName in Auth
      await updateProfile(user, { displayName: username });

      // 3. Create Firestore doc with defaults
      console.log("Signup: Before createUserDoc");
      await createUserDoc(user, username);
      console.log("Signup: After createUserDoc - success");

      toast.success("Account created!", { id: t });
      console.log("User created successfully:", user.uid);

      // 4. Navigate
      router.replace("/take-quiz");
    } catch (error: any) {
      console.error("Signup: Full error details:", error);
      toast.error("Something went wrong!", { id: t });

      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        setError("email", { message: "This email is already in use" });
      } else if (errorCode === "auth/weak-password") {
        setError("password", { message: "Password is too weak" });
      } else if (errorCode === "auth/invalid-email") {
        setError("email", { message: "Invalid email address" });
      } else {
        console.error("Signup: Unexpected error:", error);
        setError("root", {
          message: error.message || "Something went wrong. Try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    dirtyFields.username &&
    dirtyFields.email &&
    dirtyFields.password &&
    !errors.username &&
    !errors.email &&
    !errors.password;

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#131f24] overflow-hidden font-body">
      {/* Background Gradients */}
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
              Join Peruse
            </h1>
            <p className="text-gray-400">Start your journey today</p>
          </div>

          <form
            onSubmit={handleSubmit(handleCreateAccount)}
            className="space-y-6"
          >
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-300 ml-1"
              >
                Username
              </label>
              <div className="relative group">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors"
                  size={20}
                />
                <input
                  disabled={loading}
                  type="text"
                  id="username"
                  {...register("username")}
                  placeholder="John Doe"
                  className={`w-full bg-black/20 border-2 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none transition-all
                    ${errors.username ? "border-red-500/50 focus:border-red-500" : "border-transparent focus:border-blue-500/50 focus:bg-black/30"}
                  `}
                />
              </div>
              <AnimatePresence>
                {errors.username?.message && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-red-400 text-xs ml-1"
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

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
                  placeholder="john_doe@gmail.com"
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
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
