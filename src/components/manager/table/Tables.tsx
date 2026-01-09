"use client";
import { fetchTables, createTable, deleteTable } from "@/Redux/slices/Table";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FiTable, FiTrash2 } from "react-icons/fi";
import { FaPlusCircle } from "react-icons/fa";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02, duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

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
      <div className="min-h-screen bg-[#f8fafc]">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-4xl font-black text-gray-900">
                Manage <span className="text-orange-500">Tables</span>
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                Organize and monitor your restaurants seating
              </p>
            </motion.div>

            {/* Filter Menu */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100"
            >
              {(["all", "available", "booked"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    statusFilter === s
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-red-50 text-center mb-12"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrash2 className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-8">
                {typeof error === "string"
                  ? error
                  : (error as { message?: string })?.message ||
                    "Failed to load tables."}
              </p>
              <button
                onClick={() => dispatch(fetchTables())}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"
              />
              <p className="text-gray-600 font-medium">Loading Tables...</p>
            </div>
          )}

          {!loading && !error && tables.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"
            >
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <FiTable className="text-orange-200 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                No tables found
              </h3>
              <p className="text-gray-500 mt-2 font-medium">
                Add tables to get started!
              </p>
            </motion.div>
          )}

          {!loading && !error && filteredTables.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredTables.map((table) => (
                <motion.div
                  key={table?._id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 relative"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        table.status === "available"
                          ? "bg-green-50 text-green-500"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      <FiTable />
                    </div>
                    <button
                      onClick={() => openDeleteModal(table._id)}
                      className="p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                    >
                      <FiTrash2 className="text-xl" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">
                      Table {table.number}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          table.status === "available"
                            ? "bg-green-500 animate-pulse"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold uppercase tracking-wider ${
                          table.status === "available"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Floating Action Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddTable}
            className="fixed bottom-8 right-8 w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl shadow-orange-300 flex items-center justify-center z-40 transition-colors hover:bg-orange-600"
          >
            <FaPlusCircle className="text-3xl" />
          </motion.button>

          {/* Add Table Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseModal}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                  <div className="bg-orange-500 p-8 text-white">
                    <h3 className="text-3xl font-black">Add Table</h3>
                    <p className="text-orange-100 font-medium opacity-90">
                      Create a new dining spot
                    </p>
                  </div>

                  <div className="p-8">
                    <div className="mb-8">
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Table Number
                      </label>
                      <input
                        type="number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all text-gray-800 font-bold text-lg"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateTable}
                        disabled={loading}
                        className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-200 hover:bg-orange-600 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Create Table"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeDeleteModal}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                  <div className="bg-red-500 p-8 text-white">
                    <h3 className="text-3xl font-black">Confirm Delete</h3>
                    <p className="text-red-100 font-medium opacity-90">
                      This action cannot be undone
                    </p>
                  </div>

                  <div className="p-8">
                    <p className="text-gray-600 font-medium text-center mb-8">
                      Are you sure you want to remove this table from the
                      restaurant?
                    </p>

                    <div className="flex gap-4">
                      <button
                        onClick={closeDeleteModal}
                        className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                      >
                        Go Back
                      </button>
                      <button
                        onClick={handleDeleteTable}
                        disabled={loading}
                        className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-600 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Yes, Delete"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    )
  );
}
