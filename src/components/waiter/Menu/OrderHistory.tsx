"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { jwtDecode } from "jwt-decode";
import { deleteOrder } from "@/Redux/slices/Order";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/Redux/store/store";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiGrid,
  FiTrash2,
  FiUser,
  FiInfo,
} from "react-icons/fi";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
};

const GET_ORDERS_BY_WAITER_ID = gql`
  query GetOrdersByWaiterId($weaterId: String!) {
    getOrdersByWaiterId(weaterId: $weaterId) {
      _id
      weater {
        name
        userId
      }
      food {
        category
        type
        foodName
        foodImage
      }
      price
      quntity
      status
      tableNo
      createdAt
    }
  }
`;

type TokenPayload = {
  id?: string;
  _id?: string;
  role?: string;
};

type OrderHistoryItem = {
  _id: string;
  weater: {
    name: string;
    userId: string;
  };
  food: {
    category: string;
    type: string;
    foodName: string;
    foodImage: string;
  };
  price: number;
  quntity: string;
  status: "pending" | "completed" | "cancelled";
  tableNo: number;
  createdAt: Date;
};

export default function OrderHistory() {
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const [weaterId, setWeaterId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "ok" | "redirect">(
    "checking"
  );
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "completed" | "cancelled"
  >("pending");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("weater_token");

    if (!token) {
      showToast("Please Signin!", "error");
      router.replace("/");
      setAuthStatus("redirect");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const id = decoded?.id || decoded?._id || null;
      if (!id) {
        showToast("Invalid token! Please sign in again.", "error");
        router.replace("/");
        setAuthStatus("redirect");
        return;
      }
      setWeaterId(id);
      setAuthStatus("ok");
    } catch (err) {
      showToast("Invalid token! Please sign in again.", "error");
      router.replace("/");
      setAuthStatus("redirect");
    }
  }, [router, showToast]);

  const { loading, error, data, refetch } = useQuery(GET_ORDERS_BY_WAITER_ID, {
    variables: { weaterId: weaterId ?? "" },
    skip: !weaterId,
  });

  const normalizeImageUrl = (value: unknown) => {
    if (typeof value !== "string") return "";
    return value.replace(/`/g, "").trim();
  };

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  const openDeleteModal = useCallback((order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedOrder || deletingId) return;

    const orderId = selectedOrder._id;
    setDeletingId(orderId);
    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      showToast("Order deleted successfully!", "success");
      await refetch();
      closeDeleteModal();
    } catch (err) {
      showToast(
        typeof err === "string" ? err : "Failed to delete order",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  }, [
    closeDeleteModal,
    deletingId,
    dispatch,
    refetch,
    selectedOrder,
    showToast,
  ]);

  if (authStatus === "checking") {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading History...</p>
        </div>
      </section>
    );
  }

  if (authStatus === "redirect") return null;

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading History...</p>
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
    (data as { getOrdersByWaiterId: OrderHistoryItem[] | null })
      ?.getOrdersByWaiterId ?? [];
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const filteredOrders = orders.filter((o) => o.status === statusFilter);

  return (
    <AnimatePresence>
      {authStatus === "ok" && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="min-h-screen px-4 sm:px-8 py-10 bg-[#f8fafc]"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={itemVariants}
              className="mb-12 text-center md:text-left"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                    Order <span className="text-orange-500">History</span>
                  </h1>
                  <p className="text-gray-500 font-medium">
                    Track your placed orders and their current status.
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
                    activeClass: "bg-emerald-500 text-white shadow-emerald-200",
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
                <motion.button
                  key={item.key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
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
                    className={`ml-1 px-2 py-0.5 rounded-lg text-xs transition-colors ${
                      statusFilter === item.key ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    {item.count}
                  </span>
                </motion.button>
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
                  You havent placed any orders yet.
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
                  There are no orders with this status in your history.
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
                    },
                    completed: {
                      bg: "bg-emerald-50",
                      text: "text-emerald-600",
                      border: "border-emerald-100",
                    },
                    cancelled: {
                      bg: "bg-red-50",
                      text: "text-red-600",
                      border: "border-red-100",
                    },
                  }[order.status];

                  return (
                    <motion.div
                      key={order._id || index}
                      variants={itemVariants}
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
                    >
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {order.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs font-bold bg-gray-50 px-2 py-1 rounded-lg">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )
                                : "N/A"}
                            </span>
                            {order.status === "pending" && (
                              <button
                                onClick={() => openDeleteModal(order)}
                                disabled={deletingId === order._id}
                                className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90 disabled:opacity-50 shadow-sm"
                              >
                                {deletingId === order._id ? (
                                  <FiRefreshCw className="animate-spin w-4 h-4" />
                                ) : (
                                  <FiTrash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
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
                              ₹{order.price}
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-xl font-black text-gray-900 mb-2 truncate">
                            {order.food?.foodName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-100 capitalize">
                              {order.food?.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-100 capitalize">
                              {order.food?.type}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <span className="text-orange-600 text-[10px] font-black block uppercase tracking-wider mb-1">
                              Quantity
                            </span>
                            <span className="text-orange-900 font-black text-xl leading-none">
                              {order.quntity}
                            </span>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <span className="text-blue-600 text-[10px] font-black block uppercase tracking-wider mb-1">
                              Table
                            </span>
                            <span className="text-blue-900 font-black text-xl leading-none">
                              #{order.tableNo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            <AnimatePresence>
              {deleteModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeDeleteModal}
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-4 -translate-y-4">
                      <FiTrash2 size={120} />
                    </div>

                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FiTrash2 className="text-red-500 text-4xl" />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 mb-2">
                        Confirm <span className="text-red-500">Delete</span>
                      </h2>
                      <p className="text-gray-500 font-medium mb-8">
                        Are you sure you want to delete this order for{" "}
                        <span className="text-gray-900 font-bold">
                          {selectedOrder.food.foodName}
                        </span>{" "}
                        on table{" "}
                        <span className="text-gray-900 font-bold">
                          #{selectedOrder.tableNo}
                        </span>
                        ?
                      </p>

                      <div className="flex gap-4">
                        <button
                          onClick={closeDeleteModal}
                          className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmDelete}
                          disabled={deletingId === selectedOrder._id}
                          className="flex-[2] px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {deletingId === selectedOrder._id && (
                            <FiRefreshCw className="animate-spin" />
                          )}
                          {deletingId === selectedOrder._id
                            ? "Deleting..."
                            : "Delete Order"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
