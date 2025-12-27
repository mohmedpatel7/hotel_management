"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaUserTie, FaConciergeBell, FaUtensils } from "react-icons/fa";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fff8f3]">
      {/* Hero Section */}
      <div
        className="relative h-[600px] bg-cover bg-center"
        style={{ backgroundImage: "url('/food-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff5500]/90 to-[#ff5800]/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">
              Delicious Food, Delivered Fast
            </h1>
            <p className="text-2xl mb-8">
              Order your favorite meals with ease and speed.
            </p>
            <button className="bg-white text-[#ff5500] px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">
              View Menu
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#ff5500]">
          Our Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Chef Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUtensils className="w-10 h-10 text-[#ff5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Our Chefs
              </h3>
              <p className="text-gray-700">
                Crafting delicious meals with passion and expertise.
              </p>
            </div>
          </motion.div>

          {/* Delivery Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaConciergeBell className="w-10 h-10 text-[#ff5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Delivery Heroes
              </h3>
              <p className="text-gray-700">
                Ensuring your food arrives fresh and on time.
              </p>
            </div>
          </motion.div>

          {/* Support Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaUserTie className="w-10 h-10 text-[#ff5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#ff5500]">
                Customer Support
              </h3>
              <p className="text-gray-700">
                Always ready to assist you with any queries.
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

      {/* Testimonials Section */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#ff5500]">
          What Our Guests Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <p className="text-gray-700 italic mb-4">
              Absolutely stunning hotel with impeccable service. The rooms were
              luxurious and the staff went above and beyond to make our stay
              comfortable.
            </p>
            <p className="font-semibold text-[#ff5500]">- Jane Doe</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <p className="text-gray-700 italic mb-4">
              The dining experience was exceptional! Every meal was a delight,
              and the variety of options was impressive. Highly recommend!
            </p>
            <p className="font-semibold text-[#ff5500]">- John Smith</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#ff5500]"
          >
            <p className="text-gray-700 italic mb-4">
              A truly relaxing spa experience. I left feeling refreshed and
              rejuvenated. The perfect getaway!
            </p>
            <p className="font-semibold text-[#ff5500]">- Emily White</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
