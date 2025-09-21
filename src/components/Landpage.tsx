"use client";
import React from "react";
import { motion } from "framer-motion";

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
                <svg
                  className="w-10 h-10 text-[#ff5500]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
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
                <svg
                  className="w-10 h-10 text-[#ff5500]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 3v4a1 1 0 01-1 1H8a1 1 0 01-1-1V3m8 0H7m8 0a1 1 0 011 1v4a1 1 0 01-1 1m-8-6v4a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1z"
                  />
                </svg>
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
                <svg
                  className="w-10 h-10 text-[#ff5500]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
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
