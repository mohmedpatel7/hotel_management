"use client";
import { useState, useEffect } from "react";
import { FaLocationDot } from "react-icons/fa6";
import {
  FaClock,
  FaMoneyBillWave,
  FaUserTie,
  FaUtensils,
  FaHamburger,
  FaShoppingCart,
} from "react-icons/fa";
import { fetchManagerDashboard } from "@/Redux/slices/Manager";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { showToast } = useToast();
  const router = useRouter();

  const [isManager, setIsManager] = useState(false);
  useEffect(() => {
    const isManager =
      typeof window !== "undefined" &&
      localStorage.getItem("manager_token") !== null;
    setIsManager(isManager);
    if (!isManager) {
      router.replace("/");
      showToast("Please Signin!", "error");
    }
  }, [router, showToast]);
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  if (error) {
    console.log("Error in deployed version:", error);
  }

  useEffect(() => {
    if (isManager) {
      dispatch(fetchManagerDashboard());
    }
  }, [dispatch, isManager]);

  if (loading)
    return (
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading Dashboard...</p>
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="bg-white min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600">
            {typeof error === "string"
              ? error
              : (error as { message?: string })?.message || "Unknown error"}
          </p>
        </div>
      </section>
    );
  if (!dashboard) return null;

  console.log(dashboard);

  const {
    monthlyRevenue = 0,
    todaysOrdersCount = 0,
    totalWaiters = 0,
    totalCooks = 0,
    famousFoods = [],
  } = dashboard;

  return (
    isManager && (
      <div className="bg-[#ffffff] min-h-screen w-full p-6">
        {/* Header Card */}
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

        {/* Revenue Section */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Daily Orders
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {todaysOrdersCount.toLocaleString("en-IN")}
                  </p>
                </div>
                <FaShoppingCart className="text-orange-400 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Staff Section */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Staff</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Total Waiters
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {totalWaiters}
                  </p>
                </div>
                <FaUserTie className="text-orange-400 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Total Cooks
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {totalCooks}
                  </p>
                </div>
                <FaUtensils className="text-orange-400 text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Famous Foods */}
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
                  <p className="text-sm text-orange-500">
                    {item.orders}+ orders
                  </p>
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
    )
  );
};

export default Dashboard;
