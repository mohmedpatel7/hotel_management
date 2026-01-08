"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "@/Redux/slices/Order";
import type { AppDispatch } from "@/Redux/store/store";

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
      {isCook && (
        <section
          className="min-h-screen px-6 py-10"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-orange-600 md:mt-0 mt-6 text-center md:text-left">
              Order History
            </h1>

            <div className="mb-6 flex flex-wrap gap-2 items-center">
              {(
                [
                  {
                    key: "pending",
                    label: "Pending",
                    count: pendingOrders.length,
                  },
                  {
                    key: "completed",
                    label: "Completed",
                    count: completedOrders.length,
                  },
                  {
                    key: "cancelled",
                    label: "Cancelled",
                    count: cancelledOrders.length,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    statusFilter === item.key
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}

              <button
                onClick={refreshData}
                className="ml-auto px-4 py-2 rounded-full text-sm font-medium border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center text-gray-600">
                No orders found.
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center text-gray-600">
                No {statusFilter} orders found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order, index) => {
                  const imageUrl = normalizeImageUrl(order.food?.foodImage);

                  const headerClass =
                    order.status === "completed"
                      ? "from-green-400 via-green-500 to-green-600"
                      : order.status === "cancelled"
                      ? "from-red-400 via-red-500 to-red-600"
                      : "from-orange-400 via-orange-500 to-orange-600";

                  const statusClass =
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : order.status === "completed"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-red-100 text-red-800 border-red-300";

                  return (
                    <div
                      key={
                        order._id ||
                        `${order.food?.foodName ?? "order"}-${index}`
                      }
                      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div
                        className={`bg-gradient-to-r ${headerClass} px-4 py-3 flex items-start justify-between gap-3`}
                      >
                        <div className="text-white min-w-0">
                          <div className="text-base font-semibold truncate">
                            {order.food?.foodName}
                          </div>
                          <div className="text-xs text-white/90 truncate">
                            Date:{" "}
                            {order.createdAt
                              ? new Date(order.createdAt).toDateString()
                              : "N/A"}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/90 ${statusClass}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="p-2">
                        <div className="relative w-3/4 mx-auto pt-[75%] rounded-lg bg-gray-100 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={order.food?.foodName ?? "Food"}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700">
                          <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                            <div className="text-gray-500 text-[11px]">
                              Quantity
                            </div>
                            <div className="font-semibold">{order.quntity}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                            <div className="text-gray-500 text-[11px]">
                              Waiter
                            </div>
                            <div className="font-semibold truncate">
                              {order.weater?.name}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openStatusModal(order)}
                          className="mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium border border-orange-500 text-orange-600 bg-white hover:bg-orange-50 transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isModalOpen && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-modalScale">
                  <h2 className="text-xl font-semibold text-orange-500 mb-1">
                    Update Order Status
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedOrder.food?.foodName} • Table{" "}
                    {selectedOrder.tableNo}
                  </p>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Select new status:
                    </p>
                    <div className="flex gap-3">
                      {(["pending", "completed", "cancelled"] as const).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => setNewStatus(status)}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                              newStatus === status
                                ? "text-white " +
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

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={isUpdating}
                      className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                    >
                      {isUpdating && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      )}
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-modalScale {
          animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}
