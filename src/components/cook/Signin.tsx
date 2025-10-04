"use client";
import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiCook } from "react-icons/gi";
import { signInCook } from "@/Redux/slices/Cook";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/store/store";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isManager = isMounted ? localStorage.getItem("manager_token") : null;
  const isCook = isMounted ? localStorage.getItem("cook_token") : null;
  const isWaiter = isMounted ? localStorage.getItem("waiter_token") : null;

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
    setIsSubmitting(true);
    try {
      const response = await dispatch(
        signInCook({ userId: formData.userId, password: formData.password })
      ).unwrap();
      
      if (response.success === true && response.cook_token) {
        showToast(response.message || "Signin Successfully.", "success");
        // Redirect to cook dashboard or appropriate page
        window.location.href = "/dashboardCook";
      } else {
        showToast(response.message || "Signin failed. Please try again.", "error");
        // Clear any potentially set token
        localStorage.removeItem("cook_token");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      showToast(message, "error");
      // Clear any potentially set token
      localStorage.removeItem("cook_token");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ userId: "", password: "" });
    setErrors({ userId: "", password: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormFilled = Boolean(formData.userId && formData.password);

  if (!isMounted) return null;

  return (
    <>
      {!isManager && !isCook && !isWaiter && (
        <div className="min-h-screen bg-[#ffffff] flex flex-col md:flex-row items-center justify-center p-4">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
            <GiCook className="text-8xl text-[#ff5500] mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mumtaz Chicken
            </h1>
            <p className="text-gray-800 text-center font-medium">
              Cook Sign in
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!isFormFilled || isSubmitting}
                  className={`w-full py-2 rounded-lg text-white font-semibold ${
                    isFormFilled && !isSubmitting
                      ? "bg-gradient-to-r from-[#ff5500] to-[#ff5800] hover:opacity-90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full py-2 rounded-lg text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50"
                >
                  Clear
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
