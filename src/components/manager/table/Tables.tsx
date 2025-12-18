"use client";
import { fetchTables, createTable, deleteTable } from "@/Redux/slices/Table";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FiTable, FiTrash2 } from "react-icons/fi";
import { FaPlusCircle } from "react-icons/fa";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function Tables() {
  const dispatch = useDispatch<AppDispatch>();
  const { tables, loading, error } = useSelector(
    (state: RootState) => state.table
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "booked"
  >("all");

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

  // Fetch tables on mount
  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const handleAddTable = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTableNumber("");
  };

  const handleCreateTable = async () => {
    if (!tableNumber.trim()) {
      showToast("Table number is required", "error");
      return;
    }

    const tableData = {
      status: "available",
      number: parseInt(tableNumber, 10),
    };
    try {
      await dispatch(createTable(tableData)).unwrap();
      showToast("Table created successfully", "success");
      handleCloseModal();
    } catch (error) {
      showToast(
        (error as { message?: string })?.message || "Failed to create table",
        "error"
      );
    }
  };

  const openDeleteModal = (tableId: string) => {
    setSelectedTable(tableId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedTable(null);
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    try {
      await dispatch(deleteTable(selectedTable)).unwrap();
      showToast("Table deleted successfully", "success");
      dispatch(fetchTables());
    } catch (error) {
      showToast(
        (error as { message?: string })?.message || "Failed to delete table",
        "error"
      );
    } finally {
      closeDeleteModal();
    }
  };

  const filteredTables = tables.filter((table) => {
    if (statusFilter === "all") return true;
    return table.status === statusFilter;
  });

  return (
    isManager && (
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
                        openDeleteModal(table._id);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                      aria-label="Delete table"
                    >
                      <FiTrash2 className="h-6 w-6 text-red-500" />
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
        {/* Circle plus button fixed at bottom-right corner */}
        <button
          type="button"
          aria-label="Add new table"
          onClick={handleAddTable}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-bounce"
        >
          <FaPlusCircle className="w-8 h-8" />
        </button>

        {/* Modal for adding table */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-xl font-bold text-orange-600 mb-4">
                Add Table
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-800  focus:ring-orange-500"
                placeholder="Enter table number"
              />

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  disabled={loading}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for delete confirmation */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this table?
              </p>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTable}
                  disabled={loading}
                  className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  );
}
