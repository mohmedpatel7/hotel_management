"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addFoodItem } from "@/Redux/slices/Foodlist";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/Redux/store/store";
import { useToast } from "@/components/Toast";

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

  const isManager = localStorage.getItem("manager_token") !== null;
  if (!isManager) {
    router.push("/");
    showToast("Please Signin!", "error");
  }

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
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-center text-white">
                Add New Food Item
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block font-semibold text-gray-800 mb-2">
                  Food Image *
                </label>
                {errors.file && (
                  <p className="text-red-500 text-sm">{errors.file}</p>
                )}
                {!formData.preview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 file:text-white hover:file:opacity-90"
                      required
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={formData.preview}
                      alt="Food preview"
                      className="w-48 h-48 object-cover rounded-2xl border-2 border-orange-200 mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white rounded-full hover:opacity-90 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Food Name */}
              <div>
                <label className="block font-semibold text-gray-800 mb-2">
                  Food Name *
                </label>
                <input
                  type="text"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleChange}
                  placeholder="e.g., Margherita Pizza"
                  className="w-full rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-gray-800 px-4 py-2"
                  required
                />
                {errors.foodName && (
                  <p className="text-red-500 text-sm mt-1">{errors.foodName}</p>
                )}
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-gray-800 px-4 py-2"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="veg">🥗 Veg</option>
                    <option value="non-veg">🍗 Non-Veg</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-gray-800 px-4 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="soups">🍲Soups</option>
                    <option value="rice">🍚 Rice</option>
                    <option value="roti">🫓 Roti/Bread</option>
                    <option value="curry">🍛 Curry</option>
                    <option value="starter">🍢 Starter</option>
                    <option value="dessert">🍰 Dessert</option>
                    <option value="coldrinks">🍹Cold Drinks</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Half & Full Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    Half Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-800">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="halfPrice"
                      value={formData.halfPrice}
                      onChange={handleChange}
                      placeholder="0"
                      min={0}
                      className="w-full rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-gray-800 pl-8 pr-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    Full Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-800">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="fullPrice"
                      value={formData.fullPrice}
                      onChange={handleChange}
                      placeholder="0"
                      min={0}
                      className="w-full rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-500 text-gray-800 pl-8 pr-4 py-2"
                      required
                    />
                  </div>
                  {errors.fullPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={clearForm}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Add
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-xs text-gray-800 mt-6">
            * Required fields
          </p>
        </div>
      </div>
    )
  );
}
