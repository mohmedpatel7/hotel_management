"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "@/Redux/slices/Order";
import type { AppDispatch } from "@/Redux/store/store";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiGrid,
  FiUser,
} from "react-icons/fi";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Faster stagger for mobile
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 }, // Reduced y movement
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
      mass: 0.8, // Lighter feel for mobile
    },
  },
};

const GET_ORDERS_FOR_COOK = gql`
  query GetOrdersForCook {
    getOrdersForCook {
      _id
      quntity
      status
      createdAt
      tableNo
      food {
        foodImage
        foodName
      }
      weater {
        name
      }
    }
  }
`;

type Order = {
  _id: string;
  quntity: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  tableNo: number;
  food: {
    foodImage: string;
    foodName: string;
  };
  weater: {
    name: string;
  };
};

export default function CookDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const [statusFilter, setStatusFilter] = useState<
    "pending" | "completed" | "cancelled"
  >("pending");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<
    "pending" | "completed" | "cancelled"
  >("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isCook, setIsCook] = useState(false);
  useEffect(() => {
    const isCook =
      typeof window !== "undefined" &&
      localStorage.getItem("cook_token") !== null;
    setIsCook(isCook);
    if (!isCook) {
      router.replace("/");
      showToast("Please Signin!", "error");
    }
  }, [router, showToast]);

  const { loading, error, data, refetch } = useQuery(GET_ORDERS_FOR_COOK);

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  const openStatusModal = useCallback((order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleUpdateStatus = useCallback(async () => {
    if (!selectedOrder || isUpdating) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateOrderStatus({ id: selectedOrder._id, status: newStatus })
      ).unwrap();
      showToast("Order status updated successfully", "success");
      await refetch();
      closeModal();
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "Failed to update order status";
      showToast(message, "error");
    } finally {
      setIsUpdating(false);
    }
  }, [
    closeModal,
    dispatch,
    newStatus,
    refetch,
    selectedOrder,
    showToast,
    isUpdating,
  ]);

  const normalizeImageUrl = (value: unknown) => {
    if (typeof value !== "string") return "";
    return value.replace(/`/g, "").trim();
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading Orders...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-700 font-semibold mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </section>
    );
  }

  const orders =
    (data as { getOrdersForCook: Order[] | null })?.getOrdersForCook ?? [];
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const filteredOrders = orders.filter((o) => o.status === statusFilter);

  return (
    <>
      <AnimatePresence>
        {isCook && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen px-4 sm:px-8 py-10 bg-[#f8fafc] will-change-transform"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                variants={itemVariants}
                className="mb-12 text-center md:text-left will-change-transform"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                      Order <span className="text-orange-500">Queue</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                      Manage and track incoming food orders in real-time.
                    </p>
                  </div>
                  <button
                    onClick={refreshData}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-700 font-bold hover:shadow-md transition-all active:scale-95 group"
                  >
                    <FiRefreshCw
                      className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mb-8 flex flex-wrap gap-3"
              >
                {(
                  [
                    {
                      key: "pending",
                      label: "Pending",
                      count: pendingOrders.length,
                      icon: <FiClock className="w-4 h-4" />,
                      activeClass: "bg-orange-500 text-white shadow-orange-200",
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      count: completedOrders.length,
                      icon: <FiCheckCircle className="w-4 h-4" />,
                      activeClass:
                        "bg-emerald-500 text-white shadow-emerald-200",
                    },
                    {
                      key: "cancelled",
                      label: "Cancelled",
                      count: cancelledOrders.length,
                      icon: <FiXCircle className="w-4 h-4" />,
                      activeClass: "bg-red-500 text-white shadow-red-200",
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm border ${
                      statusFilter === item.key
                        ? `${item.activeClass} border-transparent shadow-lg scale-105`
                        : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-lg text-xs ${
                        statusFilter === item.key
                          ? "bg-white/20"
                          : "bg-gray-100"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </motion.div>

              {orders.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-20 text-center"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FiGrid className="text-gray-300 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500 font-medium">
                    Wait for new orders to arrive in the queue.
                  </p>
                </motion.div>
              ) : filteredOrders.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 p-20 text-center"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FiGrid className="text-gray-300 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    No {statusFilter} orders
                  </h3>
                  <p className="text-gray-500 font-medium">
                    There are currently no orders with this status.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredOrders.map((order, index) => {
                    const imageUrl = normalizeImageUrl(order.food?.foodImage);

                    const statusConfig = {
                      pending: {
                        bg: "bg-orange-50",
                        text: "text-orange-600",
                        border: "border-orange-100",
                        accent: "bg-orange-500",
                      },
                      completed: {
                        bg: "bg-emerald-50",
                        text: "text-emerald-600",
                        border: "border-emerald-100",
                        accent: "bg-emerald-500",
                      },
                      cancelled: {
                        bg: "bg-red-50",
                        text: "text-red-600",
                        border: "border-red-100",
                        accent: "bg-red-500",
                      },
                    }[order.status];

                    return (
                      <motion.div
                        key={order._id || index}
                        variants={itemVariants}
                        className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 will-change-transform"
                      >
                        <div className="p-8">
                          <div className="flex items-center justify-between mb-6">
                            <span
                              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-gray-400 text-xs font-bold">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )
                                : "N/A"}
                            </span>
                          </div>

                          <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-gray-50">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={order.food?.foodName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiGrid className="text-gray-200 text-4xl" />
                              </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm">
                              <span className="text-gray-900 font-black">
                                Qty: {order.quntity}
                              </span>
                            </div>
                          </div>

                          <div className="mb-6">
                            <h3 className="text-xl font-black text-gray-900 mb-2 truncate">
                              {order.food?.foodName}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                <FiUser className="w-4 h-4" />
                              </div>
                              Waiter:{" "}
                              <span className="text-gray-900 font-bold">
                                {order.weater?.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                              <span className="text-orange-600 text-xs font-bold block uppercase">
                                Table
                              </span>
                              <span className="text-orange-700 font-black text-lg">
                                #{order.tableNo}
                              </span>
                            </div>
                            <button
                              onClick={() => openStatusModal(order)}
                              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-gray-200"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              onClick={closeModal}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-4 -translate-y-4">
                <FiRefreshCw size={120} />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Update <span className="text-orange-500">Status</span>
                </h2>
                <p className="text-gray-500 font-medium mb-8">
                  {selectedOrder.food?.foodName} • Table #
                  {selectedOrder.tableNo}
                </p>

                <div className="space-y-4 mb-8">
                  {(["pending", "completed", "cancelled"] as const).map(
                    (status) => {
                      const config = {
                        pending: {
                          icon: <FiClock />,
                          bg: "bg-orange-50",
                          border: "border-orange-500",
                          text: "text-orange-700",
                          shadow: "shadow-orange-100",
                          activeBg: "bg-orange-500",
                        },
                        completed: {
                          icon: <FiCheckCircle />,
                          bg: "bg-emerald-50",
                          border: "border-emerald-500",
                          text: "text-emerald-700",
                          shadow: "shadow-emerald-100",
                          activeBg: "bg-emerald-500",
                        },
                        cancelled: {
                          icon: <FiXCircle />,
                          bg: "bg-red-50",
                          border: "border-red-500",
                          text: "text-red-700",
                          shadow: "shadow-red-100",
                          activeBg: "bg-red-500",
                        },
                      }[status];

                      return (
                        <button
                          key={status}
                          onClick={() => setNewStatus(status)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                            newStatus === status
                              ? `${config.bg} ${config.border} ${config.text} shadow-lg ${config.shadow}`
                              : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                newStatus === status
                                  ? `${config.activeBg} text-white`
                                  : "bg-gray-50"
                              }`}
                            >
                              {config.icon}
                            </div>
                            <span className="font-bold capitalize">
                              {status}
                            </span>
                          </div>
                          {newStatus === status && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-6 h-6 rounded-full ${config.activeBg} flex items-center justify-center`}
                            >
                              <FiCheckCircle className="text-white w-4 h-4" />
                            </motion.div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="flex-[2] px-6 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating && <FiRefreshCw className="animate-spin" />}
                    {isUpdating ? "Updating..." : "Confirm Update"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
