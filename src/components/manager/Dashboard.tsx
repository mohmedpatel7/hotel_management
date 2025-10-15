"use client";

import { FaLocationDot } from "react-icons/fa6";
import {
  FaClock,
  FaMoneyBillWave,
  FaUserTie,
  FaUtensils,
  FaHamburger,
} from "react-icons/fa";
import { fetchManagerDashboard } from "@/Redux/slices/Manager";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { useEffect } from "react";

const Dashboard = () => {
  const isManager =
    typeof window !== "undefined"
      ? localStorage.getItem("manager_token")
      : null;
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  useEffect(() => {
    if (isManager) {
      dispatch(fetchManagerDashboard());
    }
  }, [dispatch, isManager]);

  if (!isManager) return null;
  if (loading)
    return (
      <section className="bg-white min-h-screen px-6 py-10 relative">
        <div className="text-center p-8 text-gray-700 animate-pulse">
          Loading menu...
        </div>
      </section>
    );
  if (error)
    return (
      <div className="p-6 text-red-600">
        Error:{" "}
        {typeof error === "string"
          ? error
          : (error as { message?: string })?.message || "Unknown error"}
      </div>
    );
  if (!dashboard) return null;

  const {
    monthlyRevenue = 0,
    totalWaiters = 0,
    totalCooks = 0,
    famousFoods = [],
  } = dashboard;

  return (
    <div className="bg-[#ffffff] min-h-screen w-full p-6">
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-lg shadow-md p-6 mt-9">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Hotel Mumtaz Chicken
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <FaLocationDot className="text-white" />
          <span className="text-white">Surat, Gujarat, India</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-white" />
          <span className="text-white">Open: 18:00 - 01:00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-[#ffffff] rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Monthly Revenue
              </h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ₹{monthlyRevenue.toLocaleString("en-IN")}
              </p>
            </div>
            <FaMoneyBillWave className="text-orange-400 text-3xl" />
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Total Waiters</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {totalWaiters}
              </p>
            </div>
            <FaUserTie className="text-orange-400 text-3xl" />
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Total Cooks</h3>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {totalCooks}
              </p>
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
          {famousFoods.length > 0 ? (
            famousFoods.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg text-gray-800">
                  {item.name}
                </h4>
                <p className="text-gray-700">₹{item.price}</p>
                <p className="text-sm text-orange-500">{item.orders}+ orders</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No famous foods to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
