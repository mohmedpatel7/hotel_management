"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiShield,
  FiCoffee,
  FiUserCheck,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { motion, Variants } from "framer-motion";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
};

const UserCreation = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const isManager =
      typeof window !== "undefined" &&
      localStorage.getItem("manager_token") !== null;
    setIsManager(isManager);
    if (!isManager) {
      router.replace("/");
      showToast("Please Signin!", "error");
    }
  }, [router, showToast]);

  return (
    isManager && (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-8"
      >
        <div className="max-w-7xl w-full mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiUsers className="text-orange-500 text-4xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Manage <span className="text-orange-500">Accounts</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
              Create and manage staff accounts for Hotel Mumtaz Chicken. Choose
              a role below to get started.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Manager Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => router.push("/managerSignup")}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 cursor-pointer group hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <FiShield size={120} />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <FiShield className="text-blue-500 text-3xl" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  Manager
                </h2>
                <p className="text-gray-500 font-medium mb-8">
                  Full administrative access to manage the entire hotel system
                  and staff.
                </p>
                <div className="flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                  Create Account <FiArrowRight />
                </div>
              </div>
            </motion.div>

            {/* Cook Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => router.push("/cookSignup")}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 cursor-pointer group hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <FiCoffee size={120} />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <FiCoffee className="text-orange-500 text-3xl" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Cook</h2>
                <p className="text-gray-500 font-medium mb-8">
                  Access to order management and kitchen operations dashboard.
                </p>
                <div className="flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                  Create Account <FiArrowRight />
                </div>
              </div>
            </motion.div>

            {/* Waiter Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => router.push("/waiterSignup")}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 cursor-pointer group hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <FiUserCheck size={120} />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <FiUserCheck className="text-emerald-500 text-3xl" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  Waiter
                </h2>
                <p className="text-gray-500 font-medium mb-8">
                  Access to table management and order placement system.
                </p>
                <div className="flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                  Create Account <FiArrowRight />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  );
};

export default UserCreation;
