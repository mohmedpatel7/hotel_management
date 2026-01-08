"use client";
import { fetchRevenueReport } from "@/Redux/slices/Manager";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import {
  FiInbox,
  FiCalendar,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence, Variants } from "framer-motion";

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
      stiffness: 100,
    },
  },
};

export default function RevenueReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { revenueReport, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  // Default to last 24 hours
  const [from, setFrom] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateLocal(yesterday);
  });
  const [to, setTo] = useState<string>(() => formatDateLocal(new Date()));

  const handleSubmit = () => {
    if (from && to) {
      dispatch(fetchRevenueReport({ from, to }));
    }
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    dispatch(fetchRevenueReport({ from: "", to: "" }));
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] px-4 sm:px-8 py-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-black text-gray-900">
              Revenue <span className="text-orange-500">Report</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Track your restaurants financial performance
            </p>
          </motion.div>
        </div>

        {/* Filters Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                From Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all text-gray-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
                To Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all text-gray-800 font-bold"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 group"
              >
                <FiSearch className="group-hover:scale-110 transition-transform" />
                Fetch Report
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center group"
                title="Clear Filters"
              >
                <FiTrash2 className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto"
            >
              <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiAlertCircle className="text-red-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-black text-red-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600 font-medium mb-8">
                {error || "Failed to fetch revenue data"}
              </p>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-red-200"
              >
                <FiRefreshCw /> Try Again
              </button>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative">
                <div className="w-24 h-24 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                <FiTrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-2xl" />
              </div>
              <p className="mt-8 text-gray-500 font-bold text-lg animate-pulse">
                Calculating revenue...
              </p>
            </motion.div>
          ) : !revenueReport ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32"
            >
              <div className="bg-orange-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <FiInbox className="text-orange-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                No Data Fetched Yet
              </h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto">
                Select a date range above to see your restaurants revenue
                performance.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {/* Total Revenue Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-8">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FiTrendingUp className="text-green-500 text-2xl" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Total Revenue
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-400">₹</span>
                  <span className="text-5xl font-black text-gray-900">
                    {revenueReport.totalRevenue.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="mt-8 flex items-center gap-2 text-green-600 bg-green-50 w-fit px-4 py-2 rounded-xl font-bold text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live Performance
                </div>
              </motion.div>

              {/* You can add more metrics here if the API provides them, 
                  like order count, average order value, etc. */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
