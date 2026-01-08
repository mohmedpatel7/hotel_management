"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodList, deleteFoodItem } from "@/Redux/slices/Foodlist";
import { RootState, AppDispatch } from "@/Redux/store/store";
import {
  FaPlusCircle,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useToast } from "../Toast";

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
  starter: "🍢",
  curry: "🍛",
  biryani: "🍲",
  rice: "🍚",
  roti: "🫓",
  dessert: "🍰",
  beverage: "🥤",
  coldrinks: "🥤",
};

import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const MenuList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { foodItems, loading, error } = useSelector(
    (state: RootState) => state.foodlist
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localFoodItems, setLocalFoodItems] = useState(foodItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const filteredItems = localFoodItems.filter((item) =>
    item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  const handleAddFood = () => {
    router.push("/addFood");
  };

  const handleUpdate = (id: string) => {
    router.push(`/menuList/${id}`);
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteFoodItem(id)).unwrap();
      showToast("Food item deleted successfully", "success");
      setLocalFoodItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to delete food item", "error");
      }
    }
  };

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
    <div className="min-h-screen bg-[#f8fafc]">
      <motion.section
        ref={menuRef}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="px-4 md:px-8 py-10 relative"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl font-black text-gray-900 mb-2 mt-4 sm:mt-4">
                Our <span className="text-orange-500">Menu</span>
              </h1>
              <p className="text-gray-500 font-medium">
                Manage your restaurant offerings
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

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    <AnimatePresence>
                      {grouped[category].map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ y: -8 }}
                          className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden relative transition-all duration-300"
                        >
                          <div className="relative h-56 w-full overflow-hidden">
                            <img
                              src={item.foodImage}
                              alt={item.foodName}
                              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Options Menu Toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(item.id);
                              }}
                              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white rounded-2xl p-3 shadow-lg transition-all duration-200 z-20"
                            >
                              <FaEllipsisV className="text-gray-700" />
                            </button>

                            <AnimatePresence>
                              {openMenuId === item.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  className="absolute top-16 right-4 bg-white rounded-2xl shadow-2xl z-30 w-40 overflow-hidden border border-gray-100"
                                >
                                  <button
                                    onClick={() => {
                                      handleUpdate(item.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors"
                                  >
                                    <FaEdit className="text-orange-500" />
                                    <span className="text-sm font-bold">
                                      Update
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(item.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors border-t border-gray-50"
                                  >
                                    <FaTrash className="text-red-500" />
                                    <span className="text-sm font-bold">
                                      Delete
                                    </span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Status Badge */}
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

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddFood}
          className="fixed bottom-10 right-10 w-16 h-16 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-2xl shadow-orange-300 flex items-center justify-center z-40 group"
        >
          <FaPlusCircle className="w-8 h-8 group-hover:drop-shadow-lg transition-all" />
        </motion.button>
      </motion.section>
    </div>
  );
};

export default MenuList;
