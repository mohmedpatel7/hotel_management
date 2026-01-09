"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodListForWaiter } from "@/Redux/slices/Foodlist";
import { createOrder } from "@/Redux/slices/Order";
import { fetchTables } from "@/Redux/slices/Table";
import { RootState, AppDispatch } from "@/Redux/store/store";
import {
  FaSearch,
  FaTimes,
  FaUtensils,
  FaCheckCircle,
  FaExclamationTriangle,
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
    transition: {
      staggerChildren: 0.05, // Optimized for mobile
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 }, // Reduced y for smoothness
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
      mass: 0.8, // Lighter feel
    },
  },
};

const MenuList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { foodItemsForWaiter, loading, error } = useSelector(
    (state: RootState) => state.foodlist
  );
  const { loading: orderLoading } = useSelector(
    (state: RootState) => state.order
  );
  const { tables } = useSelector((state: RootState) => state.table);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localFoodItems, setLocalFoodItems] = useState(foodItemsForWaiter);
  const [searchQuery, setSearchQuery] = useState("");

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<{
    _id: string;
    foodName: string;
    halfPrice?: number;
    fullPrice: number;
  } | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<
    "half" | "full" | ""
  >("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [weaterId, setWeaterId] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    dispatch(getFoodListForWaiter());
    dispatch(fetchTables());
  }, [dispatch]);

  useEffect(() => {
    setLocalFoodItems(foodItemsForWaiter);
  }, [foodItemsForWaiter]);

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
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("weater_token");
      if (token) {
        try {
          const decodedToken: { id: string } = jwtDecode(token);
          setWeaterId(decodedToken.id);
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    }
  }, []);

  const filteredItems = localFoodItems.filter((item) =>
    item.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  const calculatePrice = () => {
    if (!selectedFoodItem || !selectedQuantity) return 0;
    if (selectedQuantity === "half") {
      return selectedFoodItem.halfPrice || 0;
    } else if (selectedQuantity === "full") {
      return selectedFoodItem.fullPrice || 0;
    }
    return 0;
  };

  const handlePlaceOrder = async () => {
    if (!selectedFoodItem || !selectedQuantity || !selectedTable || !weaterId) {
      showToast("Please select food, quantity, and table.", "error");
      return;
    }

    const price = calculatePrice();
    if (price === 0) {
      showToast("Invalid price for selected quantity.", "error");
      return;
    }

    try {
      await dispatch(
        createOrder({
          foodId: selectedFoodItem._id,
          quntity: selectedQuantity,
          price: price,
          weaterId: weaterId,
          tableNo: parseInt(selectedTable),
        })
      ).unwrap();
      showToast("Order placed successfully!", "success");
      setIsOrderModalOpen(false);
      setSelectedFoodItem(null);
      setSelectedQuantity("");
      setSelectedTable(null);
    } catch (err: unknown) {
      showToast(
        (err as { message?: string }).message ||
          "Failed to place order. Please try again.",
        "error"
      );
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
      <section className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-50 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to Load
          </h2>
          <p className="text-gray-600 mb-8">
            {typeof error === "string"
              ? error
              : (error as { message?: string })?.message ||
                "Something went wrong while fetching the menu."}
          </p>
          <button
            onClick={() => dispatch(getFoodListForWaiter())}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </section>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section
        ref={menuRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12"
      >
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl font-black text-gray-900">
              Our <span className="text-orange-500">Menu</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Select items to place orders for tables
            </p>
          </motion.div>

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <FaUtensils className="text-orange-200 text-3xl" />
            </div>
            <p className="text-gray-500 font-medium">
              No menu items found matching your search.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categoryOrder
              .filter((cat) => grouped[cat])
              .map((category) => (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  className="mb-16 last:mb-0"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">
                      {categoryEmoji[category] || "🍽️"}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                      {category}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {grouped[category].map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        layout
                        whileHover={{ y: -8 }}
                        onClick={() => {
                          if (item.status === "available") {
                            setSelectedFoodItem({
                              _id: item.id,
                              foodName: item.foodName,
                              halfPrice: item.halfPrice
                                ? Number(item.halfPrice)
                                : undefined,
                              fullPrice: Number(item.fullPrice),
                            });
                            setIsOrderModalOpen(true);
                          } else {
                            showToast(
                              "This item is currently unavailable",
                              "error"
                            );
                          }
                        }}
                        className={`group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 cursor-pointer relative will-change-transform ${
                          item.status !== "available"
                            ? "opacity-75 grayscale-[0.5]"
                            : ""
                        }`}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={item.foodImage}
                            alt={item.foodName}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          <div className="absolute top-4 right-4">
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

                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest border border-white/30">
                              {item.type}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-4">
                            {item.foodName}
                          </h3>

                          <div className="flex items-center gap-3">
                            {item.halfPrice && (
                              <div className="flex-1 bg-orange-50/50 rounded-2xl p-3 border border-orange-100/50 group-hover:bg-orange-500 transition-colors duration-300">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5 group-hover:text-orange-100">
                                  Half
                                </p>
                                <p className="text-lg font-black text-orange-600 group-hover:text-white">
                                  ₹{item.halfPrice}
                                </p>
                              </div>
                            )}
                            <div className="flex-1 bg-orange-500 rounded-2xl p-3 shadow-lg shadow-orange-200 group-hover:bg-orange-600 transition-colors duration-300">
                              <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mb-0.5">
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
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </section>

      {/* Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedFoodItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative"
            >
              <div className="bg-orange-500 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transform translate-x-4 -translate-y-4">
                  <FaUtensils size={120} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-2">Place Order</h3>
                  <p className="text-orange-100 font-medium opacity-90">
                    {selectedFoodItem.foodName}
                  </p>
                </div>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Select Portion
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFoodItem.halfPrice && (
                      <button
                        onClick={() => setSelectedQuantity("half")}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedQuantity === "half"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-100 hover:border-orange-200"
                        }`}
                      >
                        <p
                          className={`text-sm font-bold ${
                            selectedQuantity === "half"
                              ? "text-orange-600"
                              : "text-gray-400"
                          }`}
                        >
                          Half Portion
                        </p>
                        <p
                          className={`text-xl font-black ${
                            selectedQuantity === "half"
                              ? "text-orange-600"
                              : "text-gray-800"
                          }`}
                        >
                          ₹{selectedFoodItem.halfPrice}
                        </p>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedQuantity("full")}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedQuantity === "full"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-100 hover:border-orange-200"
                      } ${!selectedFoodItem.halfPrice ? "col-span-2" : ""}`}
                    >
                      <p
                        className={`text-sm font-bold ${
                          selectedQuantity === "full"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      >
                        Full Portion
                      </p>
                      <p
                        className={`text-xl font-black ${
                          selectedQuantity === "full"
                            ? "text-orange-600"
                            : "text-gray-800"
                        }`}
                      >
                        ₹{selectedFoodItem.fullPrice}
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Assign Table
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    {tables
                      ?.filter((table) => table.status === "booked")
                      .map((table) => (
                        <button
                          key={table._id}
                          onClick={() =>
                            setSelectedTable(table.number.toString())
                          }
                          className={`py-3 rounded-xl border-2 font-bold transition-all ${
                            selectedTable === table.number.toString()
                              ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200"
                              : "border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-500"
                          }`}
                        >
                          {table.number}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">
                        Total Amount
                      </p>
                      <p className="text-3xl font-black text-gray-900">
                        ₹{calculatePrice()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">
                        Status
                      </p>
                      <div className="flex items-center gap-2 text-green-500 font-bold">
                        <FaCheckCircle />
                        <span>Ready</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      orderLoading || !selectedQuantity || !selectedTable
                    }
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {orderLoading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Confirm Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default MenuList;
