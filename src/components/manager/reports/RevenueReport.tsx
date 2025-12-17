"use client";
import { fetchRevenueReport } from "@/Redux/slices/Manager";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FiInbox } from "react-icons/fi";

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RevenueReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { revenueReport, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  // Default to last 24 hours
  const [from, setFrom] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateLocal(yesterday);
  });
  const [to, setTo] = useState<string>(() => formatDateLocal(new Date()));

  const handleSubmit = () => {
    if (from && to) {
      dispatch(fetchRevenueReport({ from, to }));
    }
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    dispatch(fetchRevenueReport({ from, to }));
  };

  return (
    <section
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-orange-600">
          Revenue Report
        </h2>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-white shadow-sm transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-white shadow-sm transition"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Submit
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
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
              <p className="text-gray-700">Loading revenue...</p>
            </div>
          </div>
        )}

        {!loading && !error && !revenueReport && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiInbox className="h-20 w-20 mx-auto text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-orange-600">
                No data fetched yet
              </h3>
              <p className="text-gray-600 mt-2">
                Please select a date range to view revenue.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && revenueReport && (
          <>
            {/* Summary Section */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Revenue
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ₹{revenueReport.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
