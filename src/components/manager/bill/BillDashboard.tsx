"use client";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { updateBillStatus, resetBillState } from "@/Redux/slices/Bill";
import { AppDispatch, RootState } from "@/Redux/store/store";

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
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading Bills...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
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
              : error?.message || "Unknown error"}
          </p>
        </div>
      </section>
    );
  }

  const bills = (data as { getBill?: (typeof selectedBill)[] })?.getBill || [];

  // Helper to pick status tag color
  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Filter state

  // Group bills by status
  const pendingBills = bills.filter((b) => b?.status === "pending");
  const completedBills = bills.filter((b) => b?.status === "completed");
  const cancelledBills = bills.filter((b) => b?.status === "cancelled");

  return (
    <section
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-orange-600 md:mt-0 mt-6 text-center md:text-left">
          Bill Dashboard
        </h1>

        {/* Filter Menu */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          {(["all", "pending", "completed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            onClick={refreshData}
            className="ml-auto px-4 py-2 rounded-full text-sm font-medium border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {isManager && bills.length === 0 ? (
          <p className="text-center text-gray-600">No bills found.</p>
        ) : (
          <div className="space-y-10">
            {/* Pending Bills Section */}
            {(statusFilter === "all" || statusFilter === "pending") &&
              pendingBills.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Pending Bills ({pendingBills.length})
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingBills.slice(0, limits.pending).map((bill) => (
                      <div
                        key={bill?._id}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 px-6 py-4">
                          <div className="flex justify-between items-center text-white">
                            <span className="text-lg font-semibold">
                              {bill?.billId}
                            </span>
                            <span className="text-sm bg-orange-700 px-2 py-1 rounded-full">
                              Table {bill?.table.number}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="text-gray-800 font-semibold mb-2">
                              Orders
                            </h3>
                            <ul className="space-y-2">
                              {bill?.orders.map((order) => (
                                <li
                                  key={order._id}
                                  className="flex justify-between text-sm text-gray-700"
                                >
                                  <span>
                                    {order.food.foodName} ({order.quntity})
                                  </span>
                                  <span className="font-medium">
                                    ₹{order.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-between items-center border-t pt-4">
                            <span className="text-gray-800 font-semibold">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ₹{bill?.totalAmount}
                            </span>
                          </div>

                          <div className="mt-4 text-xs text-gray-500">
                            Date:{" "}
                            {bill?.createdAt
                              ? new Date(bill.createdAt).toLocaleString()
                              : "N/A"}
                          </div>

                          <div className="mt-6 text-right">
                            <button
                              onClick={() => bill && openModal(bill)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isManager && pendingBills.length > limits.pending && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() =>
                          setLimits((prev) => ({
                            ...prev,
                            pending: prev.pending + 10,
                          }))
                        }
                        className="px-6 py-2 bg-orange-500 text-white rounded-full shadow hover:bg-orange-600 transition"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* Completed Bills Section */}
            {isManager &&
              (statusFilter === "all" || statusFilter === "completed") &&
              completedBills.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Completed Bills ({completedBills.length})
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {completedBills.slice(0, limits.completed).map((bill) => (
                      <div
                        key={bill?._id}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-6 py-4">
                          <div className="flex justify-between items-center text-white">
                            <span className="text-lg font-semibold">
                              {bill?.billId}
                            </span>
                            <span className="text-sm bg-green-700 px-2 py-1 rounded-full">
                              Table {bill?.table.number}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="text-gray-800 font-semibold mb-2">
                              Orders
                            </h3>
                            <ul className="space-y-2">
                              {bill?.orders.map((order) => (
                                <li
                                  key={order._id}
                                  className="flex justify-between text-sm text-gray-700"
                                >
                                  <span>
                                    {order.food.foodName} ({order.quntity})
                                  </span>
                                  <span className="font-medium">
                                    ₹{order.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-between items-center border-t pt-4">
                            <span className="text-gray-800 font-semibold">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ₹{bill?.totalAmount}
                            </span>
                          </div>

                          <div className="mt-4 text-xs text-gray-500">
                            Date:{" "}
                            {bill?.createdAt
                              ? new Date(bill.createdAt).toLocaleString()
                              : "N/A"}
                          </div>

                          <div className="mt-6 text-right">
                            <button
                              onClick={() => bill && openModal(bill)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isManager && completedBills.length > limits.completed && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() =>
                          setLimits((prev) => ({
                            ...prev,
                            completed: prev.completed + 10,
                          }))
                        }
                        className="px-6 py-2 bg-orange-500 text-white rounded-full shadow hover:bg-orange-600 transition"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* Cancelled Bills Section */}
            {isManager &&
              (statusFilter === "all" || statusFilter === "cancelled") &&
              cancelledBills.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Cancelled Bills ({cancelledBills.length})
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {cancelledBills.slice(0, limits.cancelled).map((bill) => (
                      <div
                        key={bill?._id}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 px-6 py-4">
                          <div className="flex justify-between items-center text-white">
                            <span className="text-lg font-semibold">
                              {bill?.billId}
                            </span>
                            <span className="text-sm bg-red-700 px-2 py-1 rounded-full">
                              Table {bill?.table.number}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="text-gray-800 font-semibold mb-2">
                              Orders
                            </h3>
                            <ul className="space-y-2">
                              {bill?.orders.map((order) => (
                                <li
                                  key={order._id}
                                  className="flex justify-between text-sm text-gray-700"
                                >
                                  <span>
                                    {order.food.foodName} ({order.quntity})
                                  </span>
                                  <span className="font-medium">
                                    ₹{order.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-between items-center border-t pt-4">
                            <span className="text-gray-800 font-semibold">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              ₹{bill?.totalAmount}
                            </span>
                          </div>

                          <div className="mt-4 text-xs text-gray-500">
                            Date:{" "}
                            {bill?.createdAt
                              ? new Date(bill.createdAt).toLocaleString()
                              : "N/A"}
                          </div>

                          <div className="mt-6 text-right">
                            <button
                              onClick={() => bill && openModal(bill)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isManager && cancelledBills.length > limits.cancelled && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() =>
                          setLimits((prev) => ({
                            ...prev,
                            cancelled: prev.cancelled + 10,
                          }))
                        }
                        className="px-6 py-2 bg-orange-500 text-white rounded-full shadow hover:bg-orange-600 transition"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>

      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 m-4">
            <h2 className="text-2xl font-bold text-orange-600 mb-6">
              Update Bill Status
            </h2>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700">
                Bill ID: {selectedBill.billId}
              </p>
              <p className="text-sm text-gray-500">
                Table: {selectedBill.table.number}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 font-medium">Select new status:</p>
              <div className="flex gap-4">
                {(["pending", "completed", "cancelled"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                        newStatus === status
                          ? "text-white shadow-lg transform scale-105 " +
                            (status === "pending"
                              ? "bg-yellow-500 border-yellow-600"
                              : status === "completed"
                              ? "bg-green-500 border-green-600"
                              : "bg-red-500 border-red-600")
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
              >
                {isUpdating && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
