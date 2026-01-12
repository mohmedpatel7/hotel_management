"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodList, updateFoodStatus } from "@/Redux/slices/Foodlist";
import { RootState, AppDispatch } from "@/Redux/store/store";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence, Variants } from "framer-motion";

const categoryOrder = [
  "soups",
  "starter",
  "curry",
  "biryani",
  "rice",
  "roti",
  "dessert",
  "beverage",
  "coldrinks",
];

const categoryEmoji: Record<string, string> = {
  soups: "🥣",
  starter: "🍢",
  curry: "🍛",
  biryani: "🍲",
  rice: "🍚",
  roti: "🫓",
  dessert: "🍰",
  beverage: "🥤",
  coldrinks: "🥤",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }, // Faster stagger for mobile
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
      mass: 0.8,
    },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const MenuList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { foodItems, loading, error } = useSelector(
    (state: RootState) => state.foodlist
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localFoodItems, setLocalFoodItems] = useState(foodItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [cookToken, setcookToken] = useState<string | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusFoodItem, setStatusFoodItem] = useState<{
    id: string;
    foodName: string;
    status: "available" | "unavailable";
  } | null>(null);
  const [newStatus, setNewStatus] = useState<"available" | "unavailable">(
    "available"
  );

  const { showToast } = useToast();

  useEffect(() => {
    dispatch(getFoodList());
  }, [dispatch]);

  useEffect(() => {
    setLocalFoodItems(foodItems);
  }, [foodItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("cook_token");
      if (token) {
        try {
          const decodedToken: { id: string } = jwtDecode(token);
          setcookToken(decodedToken.id);
        } catch (error) {
          showToast(". Please sign in.", "error");
        }
      }
    }
  }, []);

  const openStatusModal = useCallback(
    (item: {
      id: string;
      foodName: string;
      status: "available" | "unavailable";
    }) => {
      setStatusFoodItem({
        id: item.id,
        foodName: item.foodName,
        status: item.status,
      });
      setNewStatus(item.status);
      setIsStatusModalOpen(true);
    },
    []
  );

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setStatusFoodItem(null);
  }, []);

  const handleUpdateStatus = useCallback(async () => {
    if (!statusFoodItem || statusUpdating) return;

    setStatusUpdating(true);
    try {
      await dispatch(
        updateFoodStatus({ id: statusFoodItem.id, status: newStatus })
      ).unwrap();
      showToast("Food status updated successfully!", "success");
      closeStatusModal();
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to update food status";
      showToast(message, "error");
    } finally {
      setStatusUpdating(false);
    }
  }, [
    closeStatusModal,
    dispatch,
    newStatus,
    showToast,
    statusFoodItem,
    statusUpdating,
  ]);

  const filteredItems = localFoodItems.filter((item) =>
    item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  if (loading)
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Loading Menu...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="bg-white min-h-screen px-6 py-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 mb-6">
            {typeof error === "string"
              ? error
              : (error as { message?: string })?.message || "Unknown error"}
          </p>
          <button
            onClick={() => dispatch(getFoodList())}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </section>
    );

  return (
    cookToken && (
      <div className="min-h-screen bg-[#f8fafc]">
        <motion.section
          ref={menuRef}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="px-4 md:px-8 py-10 relative will-change-transform"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <motion.div
                variants={itemVariants}
                className="will-change-transform"
              >
                <h1 className="text-4xl font-black text-gray-900 mb-2 mt-4 sm:mt-4">
                  Our <span className="text-orange-500">Menu</span>
                </h1>
                <p className="text-gray-500 font-medium">
                  Manage food availability and status
                </p>
              </motion.div>

              {/* Enhanced Search Box */}
              <motion.div variants={itemVariants} className="relative group">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm group-hover:shadow-md group-focus-within:border-orange-300 transition-all duration-300 w-full md:w-80">
                  <FaSearch className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes..."
                    className="outline-none text-sm w-full text-gray-700 bg-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {Object.entries(grouped).length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"
              >
                <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-orange-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  No items found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or add a new item
                </p>
              </motion.div>
            ) : (
              categoryOrder
                .filter((cat) => grouped[cat])
                .map((category) => (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    className="mb-16"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        {categoryEmoji[category] || "🍽️"}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                        {category}
                      </h2>
                      <div className="flex-1 h-px bg-gray-100"></div>
                    </div>

                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                      <AnimatePresence mode="popLayout">
                        {grouped[category].map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            onClick={() =>
                              openStatusModal({
                                id: item.id,
                                foodName: item.foodName,
                                status: item.status,
                              })
                            }
                            className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden relative transition-all duration-300 cursor-pointer will-change-transform"
                          >
                            <div className="relative h-56 w-full overflow-hidden">
                              <img
                                src={item.foodImage}
                                alt={item.foodName}
                                loading="lazy"
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                <span className="text-white font-bold flex items-center gap-2">
                                  <FaCloudUploadAlt /> Update Status
                                </span>
                              </div>
                              <div className="absolute bottom-4 left-4">
                                <span
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg flex items-center gap-2 ${
                                    item.status === "available"
                                      ? "bg-green-500/90 text-white"
                                      : "bg-red-500/90 text-white"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full bg-white ${
                                      item.status === "available"
                                        ? "animate-pulse"
                                        : ""
                                    }`}
                                  />
                                  {item.status}
                                </span>
                              </div>
                            </div>

                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                  {item.foodName}
                                </h3>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                                  {item.type}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                                {item.halfPrice && (
                                  <div className="flex-1 bg-orange-50 p-3 rounded-2xl text-center">
                                    <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">
                                      Half
                                    </p>
                                    <p className="text-lg font-black text-orange-700">
                                      ₹{item.halfPrice}
                                    </p>
                                  </div>
                                )}
                                <div className="flex-1 bg-orange-500 p-3 rounded-2xl text-center shadow-lg shadow-orange-200">
                                  <p className="text-[10px] font-bold text-orange-100 uppercase mb-1">
                                    Full
                                  </p>
                                  <p className="text-lg font-black text-white">
                                    ₹{item.fullPrice}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </motion.section>

        {/* Modern Status Modal */}
        <AnimatePresence>
          {isStatusModalOpen && statusFoodItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeStatusModal}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="h-2 bg-orange-500" />
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">
                        Update Status
                      </h2>
                      <p className="text-gray-500 font-medium mt-1">
                        {statusFoodItem.foodName}
                      </p>
                    </div>
                    <button
                      onClick={closeStatusModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FaTimesCircle className="text-gray-400 w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {(["available", "unavailable"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setNewStatus(status)}
                        className={`relative group flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                          newStatus === status
                            ? status === "available"
                              ? "bg-green-50 border-green-500"
                              : "bg-red-50 border-red-500"
                            : "bg-white border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                            newStatus === status
                              ? status === "available"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {status === "available" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaTimesCircle />
                          )}
                        </div>
                        <span
                          className={`font-bold capitalize ${
                            newStatus === status
                              ? status === "available"
                                ? "text-green-700"
                                : "text-red-700"
                              : "text-gray-500"
                          }`}
                        >
                          {status}
                        </span>
                        {newStatus === status && (
                          <motion.div
                            layoutId="activeStatus"
                            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                              status === "available"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          >
                            <FaCheckCircle className="w-3 h-3" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={closeStatusModal}
                      className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={statusUpdating}
                      className="flex-[2] py-4 px-6 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 shadow-lg shadow-orange-200 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {statusUpdating ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FaCloudUploadAlt className="text-xl" />
                      )}
                      {statusUpdating ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  );
};

export default MenuList;
