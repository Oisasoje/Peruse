"use client";
import React, { useEffect, useState } from "react";
import { Inter, Nunito } from "next/font/google";
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

const inter = Inter({ subsets: ["latin"], weight: "400" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700"] });

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
  const [firebaseError, setFirebaseError] = useState("");
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
    formState: { errors, touchedFields, dirtyFields },
    setError,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  // const handleGoogleSignup = async () => {
  //   const provider = new GoogleAuthProvider();

  //   setLoading(true);
  //   setFirebaseError("");
  //   const t = toast.loading("Creating account...");

  //   try {
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     await createUserDoc(user, user.displayName || "");

  //     toast.success("Account created!", { id: t });
  //     console.log("Google user:", user);

  //     router.replace("/take-quiz"); // only on success
  //   } catch (error: any) {
  //     toast.error("Something went wrong!", { id: t });

  //     if (error.code === "auth/account-exists-with-different-credential") {
  //       setError("email", {
  //         type: "firebase",
  //         message:
  //           "An account already exists with this email using a different sign-in method.",
  //       });
  //     } else if (error.code === "auth/popup-closed-by-user") {
  //       setError("email", {
  //         type: "firebase",
  //         message: "You closed the Google sign-in popup.",
  //       });
  //     } else {
  //       setError("email", {
  //         type: "firebase",
  //         message: "Something went wrong. Try again later.",
  //       });
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      {/* Form Container */}
      <div className="w-full card max-w-md mx-auto">
        <div className="card-content w-full my-auto max-w-md  p-4 md:p-5 flex flex-col gap-4 md:gap-5 items-center ">
          <h1
            className={`font-extrabold ${nunito.className} text-3xl md:text-5xl text-blue-500 text-center`}
          >
            Peruse
          </h1>

          {/* Google Signup Button*/}

          <form
            onSubmit={handleSubmit(handleCreateAccount)}
            className="w-full text-center flex flex-col gap-1.5 items-center"
          >
            {/* Name */}
            <label
              htmlFor="username"
              className="font-medium text-gray-400 text-sm md:text-base mb-1"
            >
              Username*
            </label>
            <motion.input
              disabled={loading}
              className={`w-full max-w-[280px] border-b-2 font-semibold text-sm md:text-base bg-transparent focus:outline-none text-center text-white pb-2  ${
                dirtyFields.username && errors.username
                  ? "border-red-500"
                  : dirtyFields.username && !errors.username
                    ? "border-green-500 focus:border-green-500"
                    : "border-white"
              }`}
              type="text"
              id="username"
              {...register("username")}
              placeholder="John Doe"
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />

            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                {errors.username?.message && (
                  <motion.p
                    key="username-error"
                    className="h-5 -mt-2 text-xs text-red-500"
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 4, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
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
                    ? "border-green-500 focus:border-green-500"
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

            {/* Password */}
            <label
              htmlFor="password"
              className="font-medium text-gray-400 text-sm md:text-base mb-1"
            >
              Password*
            </label>
            <motion.input
              className={`w-full max-w-[280px] border-b-2 font-semibold text-sm md:text-base text-center bg-transparent focus:outline-none pb-2 text-white  ${
                dirtyFields.password && errors.password
                  ? "border-red-500"
                  : dirtyFields.password && !errors.password
                    ? "border-green-500 focus:border-green-500"
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
              className={`w-full font-bold max-w-[180px] ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-700"
              }  ${
                inter.className
              }   px-4 py-2 text-white text-sm md:text-base font-semibold rounded-xl shadow-md mt-3`}
              whileHover={{
                scale: isFormValid ? 1.05 : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              {loading ? "Creating account..." : "Create account"}
            </motion.button>

            <p className="mt-2 text-white text-sm text-center md:text-left">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-500 underline transition hover:text-blue-400"
              >
                Log in!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
