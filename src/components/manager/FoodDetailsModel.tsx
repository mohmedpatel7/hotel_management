"use client";
import { getFoodItem, updateFoodInfo } from "@/Redux/slices/Foodlist";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/Toast";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-600 text-lg">
          Access denied. Manager login required.
        </p>
      </div>
    );
  }

  if (loading && !selectedFood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 text-lg">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl transition-all duration-700 ease-out ${
          rendered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Update Food Details
          </h2>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-6">
            <img
              src={imagePreview}
              alt="Food preview"
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
            />
          </div>

          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Name
            </label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
              required
            />
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                required
              >
                <option value="">Select Type</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                required
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half Price
              </label>
              <input
                type="text"
                name="halfPrice"
                value={formData.halfPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Price
              </label>
              <input
                type="text"
                name="fullPrice"
                value={formData.fullPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                required
              />
            </div>
          </div>

          {/* Actions */}

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => router.back()}
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodDetailsPage;
