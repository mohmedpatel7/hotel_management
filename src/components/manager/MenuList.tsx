"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFoodList } from "@/Redux/slices/Foodlist";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FaPlusCircle, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

const categoryOrder = [
  "soups",
  "starter",
  "curry",
  "biryani",
  "rice",
  "roti",
  "dessert",
  "beverage",
  "snacks",
];

const categoryEmoji: Record<string, string> = {
  starter: "🍢",
  curry: "🍛",
  biryani: "🍲",
  rice: "🍚",
  roti: "🫓",
  dessert: "🍰",
  beverage: "🥤",
  snacks: "🍿",
};

const MenuList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { foodItems, loading, error } = useSelector(
    (state: RootState) => state.foodlist
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(getFoodList());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const grouped = foodItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof foodItems>);

  const handleAddFood = () => {
    router.push("/addFood");
  };

  const handleUpdate = (id: string) => {
    router.push(`/menuList/${id}`);
  };

  // const handleDelete = async (id: string) => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete this item?"
  //   );
  //   if (!confirmed) return;
  //   await dispatch(deleteFoodItem(id));
  //   dispatch(getFoodList());
  // };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  if (loading)
    return (
      <section className="bg-white min-h-screen px-6 py-10 relative">
        <div className="text-center p-8 text-gray-700">Loading menu...</div>
        <button
          type="button"
          aria-label="Add new menu item"
          onClick={handleAddFood}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <FaPlusCircle className="w-8 h-8" />
        </button>
      </section>
    );

  if (error)
    return (
      <section className="bg-white min-h-screen px-6 py-10 relative">
        <div className="text-center p-8 text-red-500">Error: {error}</div>
        <button
          type="button"
          aria-label="Add new menu item"
          onClick={handleAddFood}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <FaPlusCircle className="w-8 h-8" />
        </button>
      </section>
    );

  return (
    <section
      ref={menuRef}
      className="bg-white min-h-screen px-6 py-10 relative"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 mb-10 text-left">
          Menu
        </h1>
        {Object.entries(grouped).length === 0 && (
          <div className="text-center p-8 text-gray-700">
            No menu items available.
          </div>
        )}
        {categoryOrder
          .filter((cat) => grouped[cat])
          .map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-700 capitalize mb-6 border-b border-orange-200 pb-2">
                {categoryEmoji[category]} {category}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[category].map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white overflow-hidden relative"
                  >
                    <div className="relative h-48 w-full">
                      <img
                        src={item.foodImage}
                        alt={item.foodName}
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow"
                        aria-label="Menu options"
                      >
                        <FaEllipsisV className="text-gray-700" />
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute top-10 right-2 bg-white rounded-lg shadow-lg z-10 w-32">
                          <button
                            onClick={() => {
                              handleUpdate(item.id);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-t-lg text-orange-600"
                          >
                            <FaEdit className="text-orange-600" />
                            <span className="text-sm">Update</span>
                          </button>
                          <button
                            // onClick={() => {
                            //   handleDelete(item.id);
                            //   setOpenMenuId(null);
                            // }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-b-lg text-red-600"
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <FaPlusCircle className="w-8 h-8" />
      </button>
    </section>
  );
};

export default MenuList;
