"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

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
  status: string;
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

  const [statusFilter, setStatusFilter] = useState<
    "pending" | "completed" | "cancelled"
  >("pending");

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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
