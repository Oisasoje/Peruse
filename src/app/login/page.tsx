"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Inter, Nunito } from "next/font/google";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"], weight: "400" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700"] });

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
        router.replace("/take-quiz"); // user is already logged in
      } else {
        setUserChecked(true); // user not logged in, show form
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    setLoading(true);
    const t = toast.loading("Logging in...");

    try {
      const result = await signInWithPopup(auth, provider);
      toast.success("Logged in!", { id: t });
      console.log("Google user:", result.user);

      router.replace("/take-quiz"); // only on success
    } catch (error: any) {
      toast.error("Something went wrong!", { id: t });

      if (error.code === "auth/account-exists-with-different-credential") {
        setError("email", {
          type: "firebase",
          message:
            "An account already exists with this email using a different sign-in method.",
        });
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("email", {
          type: "firebase",
          message: "You closed the Google sign-in popup.",
        });
      } else {
        setError("email", {
          type: "firebase",
          message: "Something went wrong. Try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const handleLogin = async (data: LoginSchema) => {
    const { email, password } = data;

    setLoading(true);
    const t = toast.loading("Logging in...");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast.success("Logged in!", { id: t });
      console.log("Logged in user:", userCredential.user);

      router.replace("/take-quiz"); // only on success
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
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-full px-3 pb-10 md:pb-0 bg-[#131f24]">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#131f24]/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 bg-[#1e1e1e] text-white px-6 py-4 rounded-2xl shadow-lg"
          >
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading...</p>
          </motion.div>
        </motion.div>
      )}
      <div className="card w-full max-w-md mx-auto  ">
        <div className="card-content p-4 md:p-5  flex flex-col gap-4 md:gap-5 items-center w-full my-auto max-w-md ">
          <h1
            className={`font-extrabold ${nunito.className} text-3xl md:text-5xl text-blue-500 text-center`}
          >
            Peruse
          </h1>

          {/** Google Login Button */}

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="w-full text-center flex flex-col gap-1.5 items-center"
          >
            <label
              htmlFor="email"
              className="font-medium text-gray-400 text-sm md:text-base mb-1"
            >
              Email*
            </label>
            <motion.input
              disabled={loading}
              className={`w-full max-w-[280px] border-b-2 font-semibold text-sm md:text-base bg-transparent focus:outline-none text-center text-white pb-2  ${
                dirtyFields.email && errors.email
                  ? "border-red-500"
                  : dirtyFields.email && !errors.email
                  ? "border-[#80FF72] focus:border-[#80FF72]"
                  : "border-white"
              }`}
              type="email"
              id="email"
              {...register("email")}
              placeholder="john_doe@gmail.com"
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />

            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                {errors.email?.message && (
                  <motion.p
                    key="email-error"
                    className="h-5 -mt-2 text-xs text-red-500"
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 4, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <label
              htmlFor="password"
              className="font-medium text-gray-400 text-sm md:text-base mb-1"
            >
              Password*
            </label>
            <motion.input
              disabled={loading}
              className={`w-full max-w-[280px] border-b-2 font-semibold text-sm md:text-base text-center bg-transparent focus:outline-none pb-2 text-white  ${
                dirtyFields.password && errors.password
                  ? "border-red-500"
                  : dirtyFields.password && !errors.password
                  ? "border-[#80FF72] focus:border-[#80FF72]"
                  : "border-white"
              }`}
              type="password"
              id="password"
              {...register("password")}
              placeholder="*******"
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />

            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                {errors.password?.message && (
                  <motion.p
                    key="password-error"
                    className="h-5 -mt-2 text-xs text-red-500"
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 4, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              disabled={loading}
              type="submit"
              className={`w-full max-w-[180px] ${inter.className} ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-700"
              }  px-4 py-2 text-sm font-semibold text-white md:text-base rounded-xl shadow-md mt-3`}
              whileHover={{
                scale: isFormValid ? 1.05 : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              {loading ? "Logging in..." : "Log in"}
            </motion.button>

            <p className="mt-2 text-white text-sm text-center md:text-left">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-500 underline transition hover:text-blue-400"
              >
                Sign up!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
