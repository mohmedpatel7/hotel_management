"use client";
import { fetchTables, createTable } from "@/Redux/slices/Table";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FiTable } from "react-icons/fi";
import { FaPlusCircle } from "react-icons/fa";
import { useToast } from "@/components/Toast";

export default function Tables() {
  const dispatch = useDispatch<AppDispatch>();
  const { tables, loading, error } = useSelector(
    (state: RootState) => state.table
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  const isManager = localStorage.getItem("manager_token") !== null;

  const { showToast } = useToast();

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

  return (
    isManager && (
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-orange-600">Tables</h2>

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

          {!loading && !error && tables.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div
                  key={table.id}
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
                    <div className="relative">
                      <button
                        onClick={() => {
                          // Toggle dropdown for this table
                          const dropdown = document.getElementById(
                            `menu-${table.id}`
                          );
                          if (dropdown) {
                            dropdown.classList.toggle("hidden");
                          }
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.cursor = "pointer")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.cursor = "default")
                        }
                        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                        aria-label="Table options"
                      >
                        <FiTable className="h-8 w-8 text-orange-500" />
                      </button>

                      {/* Dropdown menu */}
                      <div
                        id={`menu-${table.id}`}
                        className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg hidden z-10"
                      >
                        <button
                          onClick={() => {
                            // Handle delete action
                            console.log(`Delete table ${table.number}`);
                            // Add your delete logic here
                            const dropdown = document.getElementById(
                              `menu-${table.id}`
                            );
                            if (dropdown) dropdown.classList.add("hidden");
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-t-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    )
  );
}
