"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateManagerReport } from "@/Redux/slices/Manager";
import { RootState, AppDispatch } from "@/Redux/store/store";

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { report, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);

  const onGenerate = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("manager_token")
        : null;
    if (!token) return;
    dispatch(generateManagerReport({ fromDate, toDate }));
  };

  useEffect(() => {
    onGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error)
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
              : (error as { message?: string })?.message || "Unknown error"}
          </p>
        </div>
      </section>
    );

  return (
    <div className="bg-white min-h-screen w-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Reports</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {report.summary.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800">
              Completed Orders
            </h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {report.summary.completedOrders}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              ₹{report.summary.totalRevenue}
            </p>
          </div>
        </div>
      )}

      {/* Orders */}
      {report && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waiter
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.orders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {o.tableNo}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {o.weaterId?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {o.foodId?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      ₹{o.price}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {o.status}
                    </td>
                    {/* <td className="px-4 py-2 text-sm text-gray-700">
                      {new Date(o.createdAt).toLocaleString()}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tables & Waiters */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tables</h3>
            <ul className="space-y-2">
              {report.tables.map((t) => (
                <li key={t._id} className="text-gray-700">
                  Table #{t.number}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Waiters</h3>
            <ul className="space-y-2">
              {report.waiters.map((w) => (
                <li key={w._id} className="text-gray-700">
                  {w.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
export default Reports;
