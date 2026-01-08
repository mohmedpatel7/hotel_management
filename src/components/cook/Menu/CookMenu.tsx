"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodList, updateFoodStatus } from "@/Redux/slices/Foodlist";
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
          console.error("Error decoding token:", error);
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
                      onClick={() =>
                        openStatusModal({
                          id: item.id,
                          foodName: item.foodName,
                          status: item.status,
                        })
                      }
                      className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden relative opacity-0 animate-fadeInUp cursor-pointer group"
                      style={{
                        animationDelay: `${catIndex * 100 + itemIndex * 50}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={item.foodImage}
                          alt={item.foodName}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.foodName}
                          </h3>
                        </div>
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
        @keyframes modalScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }
        .animate-modalScale {
          animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {isStatusModalOpen && statusFoodItem && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-modalScale">
            <h2 className="text-xl font-semibold text-orange-500 mb-1">
              Update Food Status
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {statusFoodItem.foodName}
            </p>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Select new status:
              </p>
              <div className="flex gap-3">
                {(["available", "unavailable"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                      newStatus === status
                        ? "text-white " +
                          (status === "available"
                            ? "bg-green-500 border-green-600"
                            : "bg-red-500 border-red-600")
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={closeStatusModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={statusUpdating}
                className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
              >
                {statusUpdating && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuList;
