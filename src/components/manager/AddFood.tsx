"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addFoodItem } from "@/Redux/slices/Foodlist";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/Redux/store/store";
import { useToast } from "@/components/Toast";
import { motion, Variants } from "framer-motion";
import {
  FiPlus,
  FiUpload,
  FiX,
  FiInfo,
  FiDollarSign,
  FiType,
  FiGrid,
  FiArrowLeft,
} from "react-icons/fi";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

type ValidationErrors = {
  type?: string;
  category?: string;
  foodName?: string;
  fullPrice?: string;
  file?: string;
};

type FormData = {
  type: string;
  category: string;
  foodName: string;
  halfPrice: string;
  fullPrice: string;
  file: File | null;
  preview: string | null;
};

export default function AddFood() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    type: "",
    category: "",
    foodName: "",
    halfPrice: "",
    fullPrice: "",
    file: null,
    preview: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file: selected }));
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, preview: reader.result as string }));
      reader.readAsDataURL(selected);
      if (errors.file) setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, preview: null }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, file: null, preview: null }));
    if (errors.file) setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const clearForm = () => {
    setFormData({
      type: "",
      category: "",
      foodName: "",
      halfPrice: "",
      fullPrice: "",
      file: null,
      preview: null,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.type) newErrors.type = "Please select a food type";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.foodName.trim()) newErrors.foodName = "Food name is required";
    if (!formData.fullPrice || parseFloat(formData.fullPrice) <= 0)
      newErrors.fullPrice = "Please enter a valid full price";
    if (!formData.file) newErrors.file = "Please upload a food image";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append("type", formData.type);
    submitData.append("category", formData.category);
    submitData.append("foodName", formData.foodName);
    if (formData.halfPrice) submitData.append("halfPrice", formData.halfPrice);
    submitData.append("fullPrice", formData.fullPrice);
    submitData.append("foodImage", formData.file as File);

    try {
      const resultAction = await dispatch(addFoodItem(submitData));

      if (addFoodItem.fulfilled.match(resultAction)) {
        setErrors({});
        clearForm();
        router.push("/menuList");
      } else if (addFoodItem.rejected.match(resultAction)) {
        throw new Error((resultAction.payload as string) || "Upload failed");
      }
    } catch (error) {
      setErrors({
        ...errors,
        foodName:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    isManager && (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-8"
      >
        <div className="max-w-4xl w-full mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiPlus className="text-orange-500 text-4xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Add New <span className="text-orange-500">Dish</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium">
              Create a new entry for your hotels delicious menu.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
              {/* Image Upload Section */}
              <div className="flex flex-col items-center justify-center">
                <label className="text-lg font-bold text-gray-900 mb-4 self-start">
                  Food Image <span className="text-orange-500">*</span>
                </label>

                <div className="w-full">
                  {!formData.preview ? (
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="food-image-upload"
                        required
                      />
                      <label
                        htmlFor="food-image-upload"
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${
                          errors.file
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50 group-hover:bg-orange-50 group-hover:border-orange-200"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                            <FiUpload className="text-orange-500 text-3xl" />
                          </div>
                          <p className="mb-2 text-sm text-gray-700">
                            <span className="font-bold">Click to upload</span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG or WebP (Max. 5MB)
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative w-full h-64 rounded-[2rem] overflow-hidden group shadow-lg">
                      <img
                        src={formData.preview}
                        alt="Food preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/40 transition-all transform hover:scale-110"
                        >
                          <FiX size={24} />
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.file && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium">
                      <FiInfo /> {errors.file}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Food Name */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FiInfo className="text-orange-500" /> Food Name{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="foodName"
                    value={formData.foodName}
                    onChange={handleChange}
                    placeholder="e.g., Margherita Special Pizza"
                    className={`w-full bg-gray-50 border-2 rounded-2xl px-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium ${
                      errors.foodName
                        ? "border-red-200 focus:border-red-500"
                        : "border-gray-100 focus:border-orange-500 focus:bg-white"
                    }`}
                    required
                  />
                  {errors.foodName && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      {errors.foodName}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FiType className="text-orange-500" /> Type{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border-2 rounded-2xl px-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium appearance-none cursor-pointer ${
                      errors.type
                        ? "border-red-200 focus:border-red-500"
                        : "border-gray-100 focus:border-orange-500 focus:bg-white"
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="veg">🥗 Veg</option>
                    <option value="non-veg">🍗 Non-Veg</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FiGrid className="text-orange-500" /> Category{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border-2 rounded-2xl px-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium appearance-none cursor-pointer ${
                      errors.category
                        ? "border-red-200 focus:border-red-500"
                        : "border-gray-100 focus:border-orange-500 focus:bg-white"
                    }`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="soups">🍲 Soups</option>
                    <option value="rice">🍚 Rice</option>
                    <option value="roti">🫓 Roti/Bread</option>
                    <option value="curry">🍛 Curry</option>
                    <option value="starter">🍢 Starter</option>
                    <option value="dessert">🍰 Dessert</option>
                    <option value="coldrinks">🍹 Cold Drinks</option>
                  </select>
                </div>

                {/* Half Price */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FiDollarSign className="text-orange-500" /> Half Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="halfPrice"
                      value={formData.halfPrice}
                      onChange={handleChange}
                      placeholder="0"
                      min={0}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-orange-500 focus:bg-white transition-all duration-300 text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Full Price */}
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
                      type="number"
                      name="fullPrice"
                      value={formData.fullPrice}
                      onChange={handleChange}
                      placeholder="0"
                      min={0}
                      className={`w-full bg-gray-50 border-2 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all duration-300 text-gray-900 font-medium ${
                        errors.fullPrice
                          ? "border-red-200 focus:border-red-500"
                          : "border-gray-100 focus:border-orange-500 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                  {errors.fullPrice && (
                    <p className="text-red-500 text-sm mt-1 font-medium">
                      {errors.fullPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FiArrowLeft /> Back to Menu
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-full sm:w-auto px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiPlus /> Add Food Item
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-gray-400 mt-8"
          >
            * Required fields must be filled to list the item in menu.
          </motion.p>
        </div>
      </motion.div>
    )
  );
}
