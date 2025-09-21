"use client";

import { FaLocationDot } from "react-icons/fa6";
import {
  FaClock,
  FaMoneyBillWave,
  FaUserTie,
  FaUtensils,
  FaHamburger,
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="bg-[#ffffff] min-h-screen w-full p-6">
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-lg shadow-md p-6 mt-9">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Hotel Mumtaz Chicken
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <FaLocationDot className="text-white" />
          <span className="text-white">Surat,Gujarat,India</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-white" />
          <span className="text-white">Open: 18:00/01:00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-[#ffffff] rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Monthly Revenue
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">₹1,25,000</p>
            </div>
            <FaMoneyBillWave className="text-orange-400 text-3xl" />
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Total Waiters</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">12</p>
            </div>
            <FaUserTie className="text-orange-400 text-3xl" />
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Total Cooks</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">8</p>
            </div>
            <FaUtensils className="text-orange-400 text-3xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FaHamburger className="text-orange-500 text-xl" />
          <h3 className="text-xl font-bold text-gray-800">Famous Foods</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Butter Chicken", price: "₹350", orders: "150+ orders" },
            { name: "Tandoori Roti", price: "₹30", orders: "200+ orders" },
            { name: "Paneer Tikka", price: "₹280", orders: "120+ orders" },
            { name: "Chicken Biryani", price: "₹180", orders: "180+ orders" },
            { name: "Malai Kofta", price: "₹220", orders: "90+ orders" },
            { name: "Naan", price: "₹40", orders: "250+ orders" },
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-lg text-gray-800">
                {item.name}
              </h4>
              <p className="text-gray-700">{item.price}</p>
              <p className="text-sm text-orange-500">{item.orders}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
