"use client";
import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaConciergeBell,
} from "react-icons/fa";
import { loginWaiter } from "@/Redux/slices/Waiter";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/store/store";
import { useRouter } from "next/navigation";
import { useToast } from "../Toast";

const Signin: React.FC = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    userId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const isManager =
    typeof window !== "undefined" &&
    localStorage.getItem("manager_token") !== null;
  const isCook =
    typeof window !== "undefined" &&
    localStorage.getItem("cook_token") !== null;
  const isWaiter =
    typeof window !== "undefined" &&
    localStorage.getItem("waiter_token") !== null;

  const router = useRouter();
  const { showToast } = useToast();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { userId: "", password: "" };

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await dispatch(
        loginWaiter({ userId: formData.userId, password: formData.password })
      ).unwrap();

      if (response.success && response.weater_token) {
        localStorage.setItem("weater_token", response.weater_token);
        showToast(response.message || "Signed in successfully!", "success");
        router.push("/dashboardWaiter");
      } else {
        localStorage.removeItem("weater_token");
        showToast(response.message || "Authentication failed", "error");
      }
    } catch (err: unknown) {
      localStorage.removeItem("weater_token");
      const errorMsg =
        (err as { message?: string })?.message ||
        "Signin failed. Please try again.";
      showToast(errorMsg, "error");
      setErrors({
        userId: "",
        password: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ userId: "", password: "" });
    setErrors({ userId: "", password: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormFilled = formData.userId && formData.password;

  return (
    <>
      {!isManager && !isCook && !isWaiter && (
        <div className="min-h-screen bg-[#ffffff] flex flex-col md:flex-row items-center justify-center p-4">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
            <FaConciergeBell className="text-8xl text-[#ff5500] mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mumtaz Chicken
            </h1>
            <p className="text-gray-800 text-center font-medium">
              Waiter Sign in
            </p>
          </div>

          <div className="w-full md:w-1/2 max-w-md">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold text-[#ff5500] mb-6 text-center">
                Sign In
              </h2>

              <div className="mb-4">
                <label className="block text-gray-800 font-medium mb-2">
                  User ID
                </label>
                <div className="relative">
                  <FaUser className="absolute top-3 left-3 text-gray-600" />
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="Enter your user ID"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff5500] text-gray-800"
                  />
                </div>
                {errors.userId && (
                  <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-800 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute top-3 left-3 text-gray-600" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff5500] text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute top-3 right-3 text-gray-600"
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleClear}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
                <button
                  disabled={!isFormFilled || loading}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Signin;
