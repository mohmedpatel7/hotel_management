"use client";
import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaConciergeBell,
  FaArrowLeft,
} from "react-icons/fa";
import { loginWaiter } from "@/Redux/slices/Waiter";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/store/store";
import { useRouter } from "next/navigation";
import { useToast } from "../Toast";
import { motion, AnimatePresence, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
};

const Signin: React.FC = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    userId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const isManager =
    typeof window !== "undefined" &&
    localStorage.getItem("manager_token") !== null;
  const isCook =
    typeof window !== "undefined" &&
    localStorage.getItem("cook_token") !== null;
  const isWaiter =
    typeof window !== "undefined" &&
    localStorage.getItem("weater_token") !== null;

  const router = useRouter();
  const { showToast } = useToast();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { userId: "", password: "" };

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await dispatch(
        loginWaiter({ userId: formData.userId, password: formData.password })
      ).unwrap();

      if (response.success && response.weater_token) {
        localStorage.setItem("weater_token", response.weater_token);
        showToast(response.message || "Signed in successfully!", "success");
        router.push("/waiterTable");
      } else {
        localStorage.removeItem("weater_token");
        showToast(response.message || "Authentication failed", "error");
      }
    } catch (err: unknown) {
      localStorage.removeItem("weater_token");
      const errorMsg =
        (err as { message?: string })?.message ||
        "Signin failed. Please try again.";
      showToast(errorMsg, "error");
      setErrors({
        userId: "",
        password: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ userId: "", password: "" });
    setErrors({ userId: "", password: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormFilled = formData.userId && formData.password;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl opacity-30" />

      <AnimatePresence mode="wait">
        {!isManager && !isCook && !isWaiter && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-5xl grid md:grid-cols-2 gap-8 md:gap-0 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-orange-100/50 overflow-hidden relative z-10 border border-gray-100"
          >
            {/* Left Side: Branding & Info */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 md:p-12 flex flex-col items-center justify-center text-white relative"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <FaConciergeBell className="text-[20rem] absolute -bottom-20 -right-20 transform rotate-12" />
              </div>

              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors"
              >
                <FaArrowLeft /> Back to Home
              </motion.button>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-xl"
              >
                <FaConciergeBell className="text-6xl md:text-7xl text-white" />
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-5xl font-black mb-4 text-center tracking-tight"
              >
                Mumtaz <span className="text-orange-200">Chicken</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-orange-100 text-center font-medium max-w-xs md:text-lg"
              >
                Ready to serve excellence? Log in to manage your tables and
                orders.
              </motion.p>

              <div className="mt-12 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
                ))}
              </div>
            </motion.div>

            {/* Right Side: Sign In Form */}
            <motion.div
              variants={itemVariants}
              className="p-8 md:p-12 flex flex-col justify-center bg-white"
            >
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
                  Waiter <span className="text-orange-500">Sign In</span>
                </h2>
                <p className="text-gray-500 font-medium">
                  Access your service dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase tracking-wider">
                    User ID
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      placeholder="Enter your user ID"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[1.2rem] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-gray-800 transition-all font-medium"
                    />
                  </div>
                  {errors.userId && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-500 text-xs mt-2 ml-2 font-bold"
                    >
                      {errors.userId}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-[1.2rem] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-gray-800 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-500 text-xs mt-2 ml-2 font-bold"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="pt-4 flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClear}
                    className="flex-1 px-8 py-4 text-gray-500 bg-gray-100 rounded-[1.2rem] hover:bg-gray-200 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!isFormFilled || loading}
                    className="flex-[2] px-8 py-4 text-white bg-gray-900 hover:bg-orange-500 rounded-[1.2rem] shadow-xl shadow-gray-200 hover:shadow-orange-200 font-black uppercase text-xs tracking-widest transition-all disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Sign In Now</>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div
                variants={itemVariants}
                className="mt-10 pt-8 border-t border-gray-50 text-center"
              >
                <p className="text-gray-400 text-sm font-medium">
                  Authorized access only. By signing in you agree to our terms.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signin;
