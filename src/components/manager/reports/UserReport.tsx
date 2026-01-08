"use client";
import { fetchUsers } from "@/Redux/slices/Manager";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import {
  FiInbox,
  FiUsers,
  FiUserCheck,
  FiCoffee,
  FiShield,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface StaffMember {
  name: string;
  userId: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function UserReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const totalWaiters = users?.waiters.length ?? 0;
  const totalCooks = users?.cooks.length ?? 0;
  const totalManagers = users?.managers.length ?? 0;

  const renderTable = (
    title: string,
    data: StaffMember[],
    icon: React.ReactNode,
    colorClass: string,
    role: string
  ) => (
    <motion.div variants={itemVariants} className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-2xl ${colorClass
            .replace("text", "bg")
            .replace("600", "100")} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          <p className="text-gray-500 font-medium">
            Total {title.toLowerCase()}: {data.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Role
                </th>
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Name
                </th>
                <th className="px-8 py-6 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  User ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((user) => (
                <tr
                  key={user.userId}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${colorClass
                        .replace("text", "bg")
                        .replace("600", "100")} ${colorClass}`}
                    >
                      {role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-800">{user.name}</p>
                  </td>
                  <td className="px-8 py-6">
                    <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-600">
                      {user.userId}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] px-4 sm:px-8 py-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-black text-gray-900">
              User <span className="text-orange-500">Report</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Manage and monitor your restaurant staff
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4">
            <button
              onClick={() => dispatch(fetchUsers())}
              className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all border border-gray-100 shadow-sm flex items-center gap-2 group"
            >
              <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
              Refresh Data
            </button>
          </motion.div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto"
            >
              <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiAlertCircle className="text-red-500 text-4xl" />
              </div>
              <h3 className="text-2xl font-black text-red-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-600 font-medium mb-8">
                {error || "Failed to fetch user data"}
              </p>
              <button
                onClick={() => dispatch(fetchUsers())}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-red-200"
              >
                <FiRefreshCw /> Try Again
              </button>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative">
                <div className="w-24 h-24 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                <FiUsers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-2xl" />
              </div>
              <p className="mt-8 text-gray-500 font-bold text-lg animate-pulse">
                Fetching staff records...
              </p>
            </motion.div>
          ) : !users ? (
            <motion.div
              key="empty"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center py-32"
            >
              <div className="bg-orange-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <FiInbox className="text-orange-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                No Staff Found
              </h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto">
                We couldnt find any staff records in the system.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <FiShield className="text-blue-500 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Managers
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      {totalManagers}
                    </span>
                    <span className="text-xl font-bold text-gray-400 ml-2">
                      Active
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <FiUserCheck className="text-orange-500 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Waiters
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      {totalWaiters}
                    </span>
                    <span className="text-xl font-bold text-gray-400 ml-2">
                      Staff
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-green-100/50 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <FiCoffee className="text-green-500 text-2xl" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Cooks
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      {totalCooks}
                    </span>
                    <span className="text-xl font-bold text-gray-400 ml-2">
                      Kitchen
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Tables */}
              {renderTable(
                "Managers",
                users.managers,
                <FiShield className="text-blue-500 text-2xl" />,
                "text-blue-600",
                "Admin"
              )}
              {renderTable(
                "Waiters",
                users.waiters,
                <FiUserCheck className="text-orange-500 text-2xl" />,
                "text-orange-600",
                "Service"
              )}
              {renderTable(
                "Cooks",
                users.cooks,
                <FiCoffee className="text-green-500 text-2xl" />,
                "text-green-600",
                "Kitchen"
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
