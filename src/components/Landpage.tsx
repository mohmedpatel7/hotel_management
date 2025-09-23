"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaUserTie, FaConciergeBell, FaUtensils } from "react-icons/fa";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fff8f3]">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff5500]/90 to-[#ff5800]/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">
              Welcome to Mumtaz Chicken
            </h1>
            <p className="text-2xl">Delicious Food, Delivered Fast</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#ff5500]">
          Our Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Manager Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUserTie className="w-10 h-10 text-[#ff5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Manager
              </h3>
              <p className="text-gray-700">
                Oversees operations and ensures quality service
              </p>
            </div>
          </motion.div>

          {/* Cook Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUtensils className="w-10 h-10 text-[#ff5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Cook
              </h3>
              <p className="text-gray-700">
                Prepares delicious meals with expertise
              </p>
            </div>
          </motion.div>

          {/* Waiter Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaConciergeBell className="w-10 h-10 text-[#ff5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Waiter
              </h3>
              <p className="text-gray-700">
                Provides excellent service to customers
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#ff5500]">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Luxury Accommodations
              </h3>
              <p className="text-gray-700">
                Premium rooms and suites for your comfort
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                24/7 Service
              </h3>
              <p className="text-gray-700">Round-the-clock customer support</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Event Planning
              </h3>
              <p className="text-gray-700">
                Professional event coordination services
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default LandingPage;
