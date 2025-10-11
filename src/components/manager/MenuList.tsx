"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodList, deleteFoodItem } from "@/Redux/slices/Foodlist";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FaPlusCircle, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
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

const MenuList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { foodItems, loading, error } = useSelector(
    (state: RootState) => state.foodlist
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localFoodItems, setLocalFoodItems] = useState(foodItems);

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

  const grouped = localFoodItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof localFoodItems>);

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
      <section className="bg-white min-h-screen px-6 py-10 relative">
        <div className="text-center p-8 text-gray-700 animate-pulse">
          Loading menu...
        </div>
        <button
          type="button"
          aria-label="Add new menu item"
          onClick={handleAddFood}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce"
        >
          <FaPlusCircle className="w-8 h-8" />
        </button>
      </section>
    );

  if (error)
    return (
      <section className="bg-white min-h-screen px-6 py-10 relative">
        <div className="text-center p-8 text-red-500 animate-pulse">
          Error: {error}
        </div>
        <button
          type="button"
          aria-label="Add new menu item"
          onClick={handleAddFood}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce"
        >
          <FaPlusCircle className="w-8 h-8" />
        </button>
      </section>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <section
        ref={menuRef}
        className="bg-white min-h-screen px-6 py-10 relative"
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 mb-10 text-left animate-pulse">
            Menu
          </h1>
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
                      className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden relative opacity-0 animate-fadeInUp"
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
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow transition-transform duration-200 hover:scale-110"
                          aria-label="Menu options"
                        >
                          <FaEllipsisV className="text-gray-700" />
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute top-10 right-2 bg-white rounded-lg shadow-lg z-10 w-32 animate-fadeIn">
                            <button
                              onClick={() => {
                                handleUpdate(item.id);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-t-lg text-orange-600 transition-colors duration-200"
                            >
                              <FaEdit className="text-orange-600" />
                              <span className="text-sm">Update</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(item.id);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-b-lg text-red-600 transition-colors duration-200"
                            >
                              <FaTrash className="text-red-600" />
                              <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        )}
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

        {/* Circle plus button fixed at bottom-right corner */}
        <button
          type="button"
          aria-label="Add new menu item"
          onClick={handleAddFood}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce"
        >
          <FaPlusCircle className="w-8 h-8" />
        </button>
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
    </div>
  );
};

export default MenuList;
