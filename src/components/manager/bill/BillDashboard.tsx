"use client";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { updateBillStatus, resetBillState } from "@/Redux/slices/Bill";
import { AppDispatch, RootState } from "@/Redux/store/store";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiFilter,
  FiAlertCircle,
  FiGrid,
  FiX,
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
      stiffness: 100,
    },
  },
};

const GET_BILLS = gql`
  query getdata {
    getBill {
      _id
      billId
      tableId
      table {
        _id
        status
        number
      }
      orderIds
      orders {
        _id
        foodId
        food {
          category
          type
          foodName
        }
        quntity
        price
        weaterId
        weater {
          name
          userId
        }
        tableNo
        status
      }
      totalAmount
      status
      createdAt
    }
  }
`;

export default function BillDashboard() {
  const { data, loading, error, refetch } = useQuery(GET_BILLS);
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const {
    loading: isUpdating,
    error: updateError,
    message: updateMessage,
  } = useSelector((state: RootState) => state.bills);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<{
    _id: string;
    billId: string;
    tableId: string;
    table: { _id: string; status: string; number: number };
    orderIds: string[];
    orders: Array<{
      _id: string;
      foodId: string;
      food: { category: string; type: string; foodName: string };
      quntity: number;
      price: number;
      weaterId: string;
      weater: { name: string; userId: string };
      tableNo: number;
      status: string;
    }>;
    totalAmount: number;
    status: "pending" | "completed" | "cancelled";
    createdAt: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<
    "pending" | "completed" | "cancelled"
  >("pending");

  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "completed" | "cancelled"
  >("all");

  const [limits, setLimits] = useState({
    pending: 10,
    completed: 10,
    cancelled: 10,
  });

  const openModal = useCallback(
    (bill: {
      _id: string;
      billId: string;
      tableId: string;
      table: { _id: string; status: string; number: number };
      orderIds: string[];
      orders: Array<{
        _id: string;
        foodId: string;
        food: { category: string; type: string; foodName: string };
        quntity: number;
        price: number;
        weaterId: string;
        weater: { name: string; userId: string };
        tableNo: number;
        status: string;
      }>;
      totalAmount: number;
      status: "pending" | "completed" | "cancelled";
      createdAt: string;
    }) => {
      setSelectedBill(bill);
      setNewStatus(bill.status);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBill(null);
    dispatch(resetBillState());
  }, [dispatch]);

  const handleUpdate = useCallback(() => {
    if (selectedBill) {
      dispatch(
        updateBillStatus({ billId: selectedBill.billId, status: newStatus })
      );
    }
  }, [dispatch, selectedBill, newStatus]);

  useEffect(() => {
    if (updateMessage) {
      showToast(updateMessage, "success");
      refetch();
      closeModal();
    }
    if (updateError) {
      showToast(updateError, "error");
    }
  }, [updateMessage, updateError, showToast, refetch, closeModal]);

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

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

  if (loading) {
    return (
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-[#f8fafc] px-6 py-20 flex flex-col items-center justify-center"
      >
        <div className="relative">
          <div className="w-24 h-24 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
          <FiFileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-2xl" />
        </div>
        <p className="mt-8 text-gray-500 font-bold text-lg animate-pulse">
          Fetching bills...
        </p>
      </motion.section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#f8fafc] min-h-screen px-6 py-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto"
        >
          <div className="bg-red-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle className="text-red-500 text-4xl" />
          </div>
          <h3 className="text-2xl font-black text-red-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 font-medium mb-8">
            {typeof error === "string"
              ? error
              : error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-red-200"
          >
            <FiRefreshCw /> Try Again
          </button>
        </motion.div>
      </section>
    );
  }

  const bills = (data as { getBill?: (typeof selectedBill)[] })?.getBill || [];

  // Helper to pick status tag color
  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const renderBillCard = (bill: (typeof bills)[0]) => {
    if (!bill) return null;
    const status = bill.status as "pending" | "completed" | "cancelled";
    const colors = {
      pending: "from-amber-400 to-amber-600 shadow-amber-100",
      completed: "from-emerald-400 to-emerald-600 shadow-emerald-100",
      cancelled: "from-rose-400 to-rose-600 shadow-rose-100",
    };

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
      >
        <div
          className={`bg-gradient-to-br ${colors[status]} p-8 text-white relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <FiFileText size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
                {bill.billId}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <FiGrid className="text-xs" /> Table {bill.table.number}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">
                  Total Amount
                </p>
                <h3 className="text-4xl font-black">₹{bill.totalAmount}</h3>
              </div>
              {status === "pending" && (
                <div className="animate-pulse bg-white/20 p-2 rounded-lg">
                  <FiClock className="text-xl" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FiFileText className="text-orange-500" /> Order Details
            </h4>
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {bill.orders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center group/item"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 group-hover/item:bg-orange-50 group-hover/item:text-orange-500 transition-colors">
                      {order.quntity}x
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 group-hover/item:text-orange-600 transition-colors">
                        {order.food.foodName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {order.food.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    ₹{order.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Date & Time
              </span>
              <span className="text-sm font-bold text-gray-600">
                {bill.createdAt
                  ? new Date(bill.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <button
              onClick={() => openModal(bill)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-orange-500 text-white font-black py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-orange-200 text-xs uppercase tracking-widest"
            >
              <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
              Update
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Filter state

  // Group bills by status
  const pendingBills = bills.filter((b) => b?.status === "pending");
  const completedBills = bills.filter((b) => b?.status === "completed");
  const cancelledBills = bills.filter((b) => b?.status === "cancelled");

  return (
    <section className="min-h-screen bg-[#f8fafc] px-6 py-10 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Bill <span className="text-orange-500">Dashboard</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Manage and track all guest bills and payment statuses
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-1">
              {(["all", "pending", "completed", "cancelled"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                      statusFilter === s
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                )
              )}
            </div>
            <button
              onClick={refreshData}
              className="p-4 bg-white text-gray-400 hover:text-orange-500 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>
          </motion.div>
        </motion.div>

        {isManager && bills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiFileText className="text-gray-300 text-4xl" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No Bills Found
            </h3>
            <p className="text-gray-500 font-medium">
              There are currently no bills to display for the selected filter.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-20">
            {/* Pending Bills Section */}
            {(statusFilter === "all" || statusFilter === "pending") &&
              pendingBills.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVariants}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <FiClock className="text-amber-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">
                        Pending Bills
                      </h2>
                      <p className="text-gray-500 font-medium">
                        Awaiting payment or processing ({pendingBills.length})
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingBills
                      .slice(0, limits.pending)
                      .map((bill) => renderBillCard(bill))}
                  </div>
                  {pendingBills.length > limits.pending && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={() =>
                          setLimits((p) => ({ ...p, pending: p.pending + 10 }))
                        }
                        className="group flex items-center gap-3 bg-white hover:bg-gray-900 text-gray-900 hover:text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl shadow-gray-100 border border-gray-100 uppercase text-xs tracking-widest"
                      >
                        Load More Pending{" "}
                        <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

            {/* Completed Bills Section */}
            {(statusFilter === "all" || statusFilter === "completed") &&
              completedBills.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVariants}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <FiCheckCircle className="text-emerald-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">
                        Completed Bills
                      </h2>
                      <p className="text-gray-500 font-medium">
                        Successfully processed payments ({completedBills.length}
                        )
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {completedBills
                      .slice(0, limits.completed)
                      .map((bill) => renderBillCard(bill))}
                  </div>
                  {completedBills.length > limits.completed && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={() =>
                          setLimits((p) => ({
                            ...p,
                            completed: p.completed + 10,
                          }))
                        }
                        className="group flex items-center gap-3 bg-white hover:bg-gray-900 text-gray-900 hover:text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl shadow-gray-100 border border-gray-100 uppercase text-xs tracking-widest"
                      >
                        Load More Completed{" "}
                        <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

            {/* Cancelled Bills Section */}
            {(statusFilter === "all" || statusFilter === "cancelled") &&
              cancelledBills.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVariants}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                      <FiXCircle className="text-rose-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">
                        Cancelled Bills
                      </h2>
                      <p className="text-gray-500 font-medium">
                        Voided or cancelled transactions (
                        {cancelledBills.length})
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {cancelledBills
                      .slice(0, limits.cancelled)
                      .map((bill) => renderBillCard(bill))}
                  </div>
                  {cancelledBills.length > limits.cancelled && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={() =>
                          setLimits((p) => ({
                            ...p,
                            cancelled: p.cancelled + 10,
                          }))
                        }
                        className="group flex items-center gap-3 bg-white hover:bg-gray-900 text-gray-900 hover:text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl shadow-gray-100 border border-gray-100 uppercase text-xs tracking-widest"
                      >
                        Load More Cancelled{" "}
                        <FiRefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
          </div>
        )}
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <FiRefreshCw className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      Update Status
                    </h3>
                    <p className="text-gray-500 font-medium text-sm">
                      Modify bill transaction state
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <FiX />
                </button>
              </div>

              {/* Bill Summary */}
              <div className="bg-gray-50 rounded-3xl p-6 mb-10 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Bill Identifier
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {selectedBill.billId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Assigned Table
                  </span>
                  <span className="text-sm font-black text-orange-600">
                    Table {selectedBill.table.number}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-6 mb-10">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Choose New Status
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {(["pending", "completed", "cancelled"] as const).map(
                    (status) => {
                      const isActive = newStatus === status;
                      const statusColors = {
                        pending: "border-amber-100 bg-amber-50 text-amber-600",
                        completed:
                          "border-emerald-100 bg-emerald-50 text-emerald-600",
                        cancelled: "border-rose-100 bg-rose-50 text-rose-600",
                      };
                      const activeColors = {
                        pending:
                          "bg-amber-500 border-amber-500 text-white shadow-amber-200",
                        completed:
                          "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200",
                        cancelled:
                          "bg-rose-500 border-rose-500 text-white shadow-rose-200",
                      };

                      return (
                        <button
                          key={status}
                          onClick={() => setNewStatus(status)}
                          className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all duration-300 font-black uppercase text-xs tracking-widest ${
                            isActive
                              ? activeColors[status] + " shadow-xl scale-[1.02]"
                              : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {status === "pending" && <FiClock />}
                            {status === "completed" && <FiCheckCircle />}
                            {status === "cancelled" && <FiXCircle />}
                            {status}
                          </div>
                          {isActive && <FiCheckCircle className="text-lg" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black py-4 rounded-2xl transition-all duration-300 uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-[2] bg-gray-900 hover:bg-orange-500 disabled:bg-gray-200 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-orange-200 uppercase text-xs tracking-widest flex items-center justify-center gap-3"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiRefreshCw /> Update Transaction
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </section>
  );
}
