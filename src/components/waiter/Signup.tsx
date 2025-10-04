"use client";
import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaConciergeBell,
} from "react-icons/fa";
import { AppDispatch } from "@/Redux/store/store";
import { useDispatch } from "react-redux";
import { createWaiter } from "@/Redux/slices/Waiter";
import { useRouter } from "next/navigation";
import { useToast } from "../Toast";

const Signup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    userId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isManager = localStorage.getItem("manager_token");

  const { showToast } = useToast();

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      userId: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    if (validateForm()) {
      setIsLoading(true);
      try {
        const { confirmPassword, ...submitData } = formData;
        const response = await dispatch(createWaiter(submitData)).unwrap();
        showToast(response.message || "Signup Successfully.", "success");
        handleClear();
      } catch (error) {
        const errorMsg =
          (error as { message?: string })?.message ||
          "Signup failed. Please try again.";
        showToast(errorMsg, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData({ name: "", userId: "", password: "", confirmPassword: "" });
    setErrors({ name: "", userId: "", password: "", confirmPassword: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isFormFilled =
    formData.name &&
    formData.userId &&
    formData.password &&
    formData.confirmPassword;

  return (
    <>
      {isManager && (
        <div className="min-h-screen bg-[#ffffff] flex flex-col md:flex-row items-center justify-center p-4">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
            <FaConciergeBell className="text-8xl text-[#ff5500] mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mumtaz Chicken
            </h1>
            <p className="text-gray-800 text-center font-medium">
              Waiter Registration
            </p>
          </div>

          <div className="w-full md:w-1/2 max-w-md">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold text-[#ff5500] mb-6 text-center">
                Sign Up
              </h2>

              <div className="mb-4">
                <label className="block text-gray-800 font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaConciergeBell className="absolute top-3 left-3 text-gray-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff5500] text-gray-800"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

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

              <div className="mb-4">
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

              <div className="mb-6">
                <label className="block text-gray-800 font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute top-3 left-3 text-gray-600" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff5500] text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute top-3 right-3 text-gray-600"
                  >
                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!isFormFilled || isLoading}
                  className={`w-full py-2 rounded-lg text-white font-semibold ${
                    isFormFilled && !isLoading
                      ? "bg-gradient-to-r from-[#ff5500] to-[#ff5800] hover:opacity-90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Submitting..." : "Sign Up"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="w-full py-2 rounded-lg text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
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

export default Signup;
