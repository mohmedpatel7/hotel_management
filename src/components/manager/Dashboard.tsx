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
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-700 font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="bg-white min-h-screen px-6 py-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
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
          <h3 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 mb-6">
            {typeof error === "string"
              ? error
              : (error as { message?: string })?.message || "Unknown error"}
          </p>
          <button
            onClick={() => dispatch(fetchManagerDashboard())}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </section>
    );

  if (!dashboard) return null;

  const {
    monthlyRevenue = 0,
    todaysOrdersCount = 0,
    totalWaiters = 0,
    totalCooks = 0,
    famousFoods = [],
  } = dashboard;

  const staffData = [
    { name: "Waiters", value: totalWaiters, color: "#f97316" },
    { name: "Cooks", value: totalCooks, color: "#fb923c" },
  ];

  const chartData = famousFoods.map((item) => {
    const orders = parseInt(item.orders.toString()) || 0;
    const price =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return {
      name: item.name,
      orders: orders,
      price: price,
      revenue: orders * price,
    };
  });

  const COLORS = ["#f97316", "#0ea5e9", "#8b5cf6", "#ec4899", "#10b981"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    isManager && (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-[#f8fafc] min-h-screen w-full p-4 md:p-8"
      >
        {/* Header Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-2xl p-8 mb-8 text-white mt-10"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">
              Hotel Mumtaz Chicken
            </h2>
            <div className="flex flex-wrap gap-6 text-orange-50">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <FaLocationDot />
                <span className="text-sm font-medium">
                  Surat, Gujarat, India
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <FaClock />
                <span className="text-sm font-medium">Open: 18:00 - 01:00</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Monthly Revenue",
              value: `₹${monthlyRevenue.toLocaleString("en-IN")}`,
              icon: FaMoneyBillWave,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              title: "Daily Orders",
              value: todaysOrdersCount.toLocaleString("en-IN"),
              icon: FaShoppingCart,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Total Staff",
              value: totalWaiters + totalCooks,
              icon: FaUsers,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              title: "Famous Items",
              value: famousFoods.length,
              icon: FaHamburger,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Famous Foods Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaChartLine className="text-orange-500" />
                Orders Volume by Item
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Staff Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUserTie className="text-orange-500" />
              Staff Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {staffData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Contribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" />
              Revenue Share by Top Items
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="name"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pricing Comparison */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaUtensils className="text-blue-500" />
              Menu Pricing Comparison
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => `₹${value}`}
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="price"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Famous Foods Detailed List */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <FaUtensils size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Top Performing Items
              </h3>
              <p className="text-sm text-gray-500">
                Based on total order count
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {famousFoods.length > 0 ? (
                famousFoods.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-gray-50 hover:bg-orange-50 rounded-2xl p-5 transition-all duration-300 border border-transparent hover:border-orange-100"
                  >
                    <h4 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors mb-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.price}
                      </p>
                      <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                          {item.orders}+ Orders
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <FaHamburger className="mx-auto text-4xl mb-3 opacity-20" />
                  <p className="text-lg font-medium">
                    No famous foods recorded yet
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    )
  );
};

export default Dashboard;
