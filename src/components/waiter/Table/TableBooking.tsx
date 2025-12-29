"use client";
import { fetchTables, updateTableStatus } from "@/Redux/slices/Table";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FiTable, FiEdit } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function Tables() {
  const dispatch = useDispatch<AppDispatch>();
  const { tables, loading, error } = useSelector(
    (state: RootState) => state.table
  );

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [tableToUpdate, setTableToUpdate] = useState<{
    id: string;
    status: string;
    number: number;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<"available" | "booked">(
    "available"
  );

  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "booked"
  >("all");

  const { showToast } = useToast();

  const router = useRouter();

  const [isWaiter, setisWaiter] = useState(false);
  useEffect(() => {
    const isWaiter =
      typeof window !== "undefined" &&
      localStorage.getItem("weater_token") !== null;
    setisWaiter(isWaiter);
    if (!isWaiter) {
      router.replace("/");
      showToast("Please Signin!", "error");
    }
  }, [router, showToast]);

  // Fetch tables on mount
  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const openUpdateModal = (table: {
    _id: string;
    status: string;
    number: number;
  }) => {
    setTableToUpdate({
      id: table._id,
      status: table.status,
      number: table.number,
    });
    setNewStatus(table.status as "available" | "booked");
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setTableToUpdate(null);
  };

  const handleUpdateTableStatus = async () => {
    if (!tableToUpdate || !newStatus) return;

    try {
      await dispatch(
        updateTableStatus({ id: tableToUpdate.id, status: newStatus })
      ).unwrap();
      showToast("Table status updated successfully", "success");
      dispatch(fetchTables());
      closeUpdateModal();
    } catch (error) {
      showToast(
        (error as { message?: string })?.message ||
          "Failed to update table status",
        "error"
      );
    }
  };

  const filteredTables = tables.filter((table) => {
    if (statusFilter === "all") return true;
    return table.status === statusFilter;
  });

  return (
    isWaiter && (
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-orange-600 md:mt-0 mt-6 text-center md:text-left">
            Tables
          </h2>

          {/* Filter Menu */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(["all", "available", "booked"] as const).map((s) => (
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
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6 max-w-md mx-auto text-center mb-8">
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
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700">Loading tables...</p>
              </div>
            </div>
          )}

          {!loading && !error && tables.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <FiTable className="h-20 w-20 mx-auto text-orange-400 mb-4" />
                <h3 className="text-xl font-semibold text-orange-600">
                  No tables found
                </h3>
                <p className="text-gray-600 mt-2">
                  Please add tables to view them here.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && filteredTables.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {filteredTables.map((table) => (
                <div
                  key={table?._id}
                  className={`p-6 rounded-xl shadow-lg border transition-colors ${
                    table.status === "occupied" || table.status === "booked"
                      ? "bg-red-100 border-red-300"
                      : "bg-green-100 border-green-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Table {table.number}
                    </h3>
                    <button
                      onClick={() => {
                        openUpdateModal(table);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                      aria-label="Edit table status"
                    >
                      <FiEdit className="h-6 w-6 text-orange-500" />
                    </button>
                  </div>
                  <p
                    className={`text-lg font-semibold capitalize ${
                      table.status === "booked"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {table.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for update status */}
        {isUpdateModalOpen && tableToUpdate && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-xl font-bold text-orange-600 mb-4">
                Update Table Status
              </h3>
              <p className="text-gray-700 mb-4">
                Table Number: {tableToUpdate.number}
              </p>

              <div className="space-y-2">
                <p className="text-gray-600 font-medium">Select new status:</p>
                <div className="flex gap-4">
                  {(["available", "booked"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`flex-1 px-4 py-3 rounded-md text-sm font-semibold border transition-all duration-200 ${
                        newStatus === status
                          ? "text-white shadow-lg transform scale-105 " +
                            (status === "available"
                              ? "bg-green-500 border-green-600"
                              : "bg-red-500 border-red-600")
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={closeUpdateModal}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTableStatus}
                  disabled={loading}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  );
}
