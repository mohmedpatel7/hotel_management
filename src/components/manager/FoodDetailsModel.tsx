"use client";
import { getFoodItem, updateFoodInfo } from "@/Redux/slices/Foodlist";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiX,
  FiInfo,
  FiDollarSign,
  FiType,
  FiGrid,
} from "react-icons/fi";

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

const FoodDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const foodId = params.id as string;
  const { showToast } = useToast();

  const dispatch = useDispatch<AppDispatch>();
  const { selectedFood, loading } = useSelector(
    (state: RootState) => state.foodlist
  );

  const [formData, setFormData] = useState({
    foodName: "",
    category: "",
    type: "",
    halfPrice: "",
    fullPrice: "",
  });
  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRendered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsManager(!!localStorage.getItem("manager_token"));
  }, []);

  useEffect(() => {
    if (foodId) {
      dispatch(getFoodItem(foodId));
    }
  }, [foodId, dispatch]);

  useEffect(() => {
    if (selectedFood) {
      setFormData({
        foodName: selectedFood.foodName || "",
        category: selectedFood.category || "",
        type: selectedFood.type || "",
        halfPrice: String(selectedFood.halfPrice || ""),
        fullPrice: String(selectedFood.fullPrice || ""),
      });
      setImagePreview(selectedFood.foodImage || null);
    }
  }, [selectedFood]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoodImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("id", foodId);
    if (formData.type) formDataToSend.append("type", formData.type);
    if (formData.category) formDataToSend.append("category", formData.category);
    if (formData.foodName) formDataToSend.append("foodName", formData.foodName);
    if (formData.halfPrice !== undefined && formData.halfPrice !== "")
      formDataToSend.append("halfPrice", formData.halfPrice);
    if (formData.fullPrice !== undefined && formData.fullPrice !== "")
      formDataToSend.append("fullPrice", formData.fullPrice);
    if (foodImage) formDataToSend.append("foodImage", foodImage);

    try {
      await dispatch(
        updateFoodInfo({
          id: foodId,
          type: formData.type,
          category: formData.category,
          foodName: formData.foodName,
          halfPrice: formData.halfPrice,
          fullPrice: formData.fullPrice,
          foodImage: foodImage,
        })
      ).unwrap();
      showToast("Food item updated successfully!", "success");
    } catch (err: unknown) {
      const message = (err as string) || "Failed to update food item.";
      showToast(message, "error");
    }
  };

  if (!isManager) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl text-center"
        >
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiX className="text-red-500 text-3xl" />
          </div>
          <p className="text-gray-900 text-lg font-bold">Access Denied</p>
          <p className="text-gray-500 mb-6">
            Manager login required to edit menu items.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="px-6 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-900 font-bold text-xl">
            Loading dish details...
          </p>
          <p className="text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl w-full mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-6">
            <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
              <FiEdit className="text-orange-500 text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                Edit <span className="text-orange-500">Details</span>
              </h1>
              <p className="text-gray-500 font-medium">
                Update menu item information
              </p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-4 text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-md rounded-2xl transition-all duration-300"
            aria-label="Go back"
          >
            <FiX size={28} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Preview */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Dish Preview
              </label>
              <div className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-inner bg-gray-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <FiUpload size={48} className="mb-2" />
                    <p className="text-xs font-medium">No Image Available</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <label
                    htmlFor="food-image-update"
                    className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white cursor-pointer hover:bg-white/40 transition-all transform hover:scale-110"
                  >
                    <FiUpload size={24} />
                  </label>
                </div>
              </div>
              <input
                type="file"
                id="food-image-update"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-center text-xs text-gray-400 mt-4">
                Click the icon to change the image
              </p>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Food Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FiInfo className="text-orange-500" /> Food Name{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="foodName"
                    value={formData.foodName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium focus:border-orange-500 focus:bg-white"
                    required
                  />
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <FiType className="text-orange-500" /> Type{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium appearance-none cursor-pointer focus:border-orange-500 focus:bg-white"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="veg">🥗 Veg</option>
                      <option value="non-veg">🍗 Non-Veg</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <FiGrid className="text-orange-500" /> Category{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium focus:border-orange-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <FiDollarSign className="text-orange-500" /> Half Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        ₹
                      </span>
                      <input
                        type="text"
                        name="halfPrice"
                        value={formData.halfPrice}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium focus:border-orange-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <FiDollarSign className="text-orange-500" /> Full Price{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        ₹
                      </span>
                      <input
                        type="text"
                        name="fullPrice"
                        value={formData.fullPrice}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium focus:border-orange-500 focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FiArrowLeft /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiSave /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FoodDetailsPage;
