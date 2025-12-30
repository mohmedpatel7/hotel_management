"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodList, deleteFoodItem } from "@/Redux/slices/Foodlist";
import { createOrder } from "@/Redux/slices/Order";
import { fetchTables } from "@/Redux/slices/Table";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FaSearch } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/components/Toast";

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

const MenuList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { foodItems, loading, error } = useSelector(
    (state: RootState) => state.foodlist
  );
  const { loading: orderLoading } = useSelector(
    (state: RootState) => state.order
  );
  const { tables } = useSelector((state: RootState) => state.table);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localFoodItems, setLocalFoodItems] = useState(foodItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    dispatch(getFoodList());
    dispatch(fetchTables());
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
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading Menu...</p>
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="bg-white min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600">
            {typeof error === "string"
              ? error
              : (error as { message?: string })?.message || "Unknown error"}
          </p>
        </div>
      </section>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <section
        ref={menuRef}
        className="bg-white min-h-screen px-6 py-10 relative"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header with Search */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 animate-pulse">
              Menu
            </h1>

            {/* Search Box */}
            <div className="flex items-center gap-2">
              {/* Mobile: show icon only until clicked */}
              <div className="md:hidden">
                {!showSearch ? (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                    aria-label="Open search"
                  >
                    <FaSearch className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 bg-white border border-orange-200 rounded-lg px-3 py-2 shadow w-full max-w-xs">
                    <div className="flex items-center gap-2">
                      <FaSearch className="text-orange-500" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search food..."
                        className="outline-none text-sm flex-1 text-gray-700"
                      />
                      <button
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery("");
                        }}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close search"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: always show search input */}
              <div className="hidden md:flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-2 shadow">
                <FaSearch className="text-orange-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food..."
                  className="outline-none text-sm w-48 text-gray-700"
                />
              </div>
            </div>
          </div>

          {Object.entries(grouped).length === 0 && (
            <div className="text-center p-8 text-gray-700 animate-pulse">
              No menu items available.
            </div>
          )}
          {categoryOrder
            .filter((cat) => grouped[cat])
            .map((category, catIndex) => (
              <div
                key={category}
                className="mb-12 opacity-0 animate-fadeIn"
                style={{
                  animationDelay: `${catIndex * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <h2 className="text-2xl font-bold text-gray-700 capitalize mb-6 border-b border-orange-200 pb-2">
                  {categoryEmoji[category]} {category}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[category].map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden relative opacity-0 animate-fadeInUp cursor-pointer"
                      onClick={() => {
                        setSelectedFoodItem({
                          _id: item.id,
                          foodName: item.foodName,
                          halfPrice: item.halfPrice
                            ? Number(item.halfPrice)
                            : undefined,
                          fullPrice: Number(item.fullPrice),
                        });
                        setIsOrderModalOpen(true);
                      }}
                      style={{
                        animationDelay: `${catIndex * 100 + itemIndex * 50}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={item.foodImage}
                          alt={item.foodName}
                          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.foodName}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-gray-500 capitalize">
                            {item.type}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.halfPrice && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                                ½: ₹{item.halfPrice}
                              </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                              Full: ₹{item.fullPrice}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${
                              item.status === "available"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm text-gray-600 capitalize">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-in-out;
        }
      `}</style>

      {/* Order Modal */}
      {isOrderModalOpen && selectedFoodItem && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-bold text-orange-600 mb-4">
              Place Order for {selectedFoodItem.foodName}
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quantity:
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedQuantity}
                onChange={(e) =>
                  setSelectedQuantity(e.target.value as "half" | "full")
                }
              >
                <option value="">Select Quantity</option>
                {selectedFoodItem.halfPrice && (
                  <option value="half">
                    Half (₹{selectedFoodItem.halfPrice})
                  </option>
                )}
                <option value="full">
                  Full (₹{selectedFoodItem.fullPrice})
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Table Number:
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedTable || ""}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="">Select Table</option>
                {tables
                  ?.filter((table) => table.status === "booked")
                  .map((table) => (
                    <option key={table._id} value={table.number}>
                      Table {table.number} ({table.status})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsOrderModalOpen(false);
                  setSelectedFoodItem(null);
                  setSelectedQuantity("");
                  setSelectedTable(null);
                }}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
              >
                {orderLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuList;
