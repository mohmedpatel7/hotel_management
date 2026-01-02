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
              { key: "pending", label: "Pending", count: pendingOrders.length },
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
                    order._id || `${order.food?.foodName ?? "order"}-${index}`
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
                        Table {order.tableNo} • {order.food?.category} •{" "}
                        {order.food?.type}
                      </div>
                      <div className="text-xs text-white/90 truncate">
                        Date:{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-xs bg-black/20 px-2.5 py-0.5 rounded-full text-white">
                        ₹{order.price}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/90 ${statusClass}`}
                      >
                        {order.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(order)}
                        disabled={deletingId === order._id}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete order"
                        title="Delete order"
                      >
                        {deletingId === order._id ? (
                          <div className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
                        <div className="text-gray-500 text-[11px]">Waiter</div>
                        <div className="font-semibold truncate">
                          {order.weater?.name}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                        <div className="text-gray-500 text-[11px]">
                          Category
                        </div>
                        <div className="font-semibold truncate">
                          {order.food?.category}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                        <div className="text-gray-500 text-[11px]">Type</div>
                        <div className="font-semibold truncate">
                          {order.food?.type}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {deleteModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this order for{" "}
                <span className="font-semibold">
                  {selectedOrder.food.foodName}
                </span>{" "}
                on table {selectedOrder.tableNo}?
              </p>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === selectedOrder._id}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                  type="button"
                >
                  {deletingId === selectedOrder._id && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
