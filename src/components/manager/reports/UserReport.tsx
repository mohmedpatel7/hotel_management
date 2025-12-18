"use client";
import { fetchUsers } from "@/Redux/slices/Manager";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FiInbox } from "react-icons/fi";

export default function UserReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const totalWaiters = users?.waiters.length ?? 0;
  const totalCooks = users?.cooks.length ?? 0;
  const totalManagers = users?.managers.length ?? 0;

  return (
    <section
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-orange-600 md:mt-0 mt-6 text-center md:text-left">
          User Report
        </h2>

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
              <p className="text-gray-700">Loading users...</p>
            </div>
          </div>
        )}

        {!loading && !error && !users && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiInbox className="h-20 w-20 mx-auto text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-orange-600">
                No data fetched yet
              </h3>
              <p className="text-gray-600 mt-2">
                Please wait while we fetch user data.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && users && (
          <>
            {/* Managers Section */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-orange-600 mb-2">
                Managers
              </h3>
              <hr className="border-t-1 text-orange-400 mb-4" />
              <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="px-6 py-4 text-left font-semibold">
                        User Type
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        User ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.managers.map((manager) => (
                      <tr
                        key={manager.userId}
                        className="hover:bg-orange-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-orange-700 font-medium">
                          Manager
                        </td>
                        <td className="px-6 py-4 text-orange-800 font-medium">
                          {manager.name}
                        </td>
                        <td className="px-6 py-4 text-orange-600 font-medium">
                          {manager.userId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Waiters Section */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-orange-600 mb-2">
                Waiters
              </h3>
              <hr className="border-t-1 text-orange-400 mb-4" />
              <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="px-6 py-4 text-left font-semibold">
                        User Type
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        User ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.waiters.map((waiter) => (
                      <tr
                        key={waiter.userId}
                        className="hover:bg-orange-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-orange-700 font-medium">
                          Waiter
                        </td>
                        <td className="px-6 py-4 text-orange-800 font-medium">
                          {waiter.name}
                        </td>
                        <td className="px-6 py-4 text-orange-600 font-medium">
                          {waiter.userId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cooks Section */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-orange-600 mb-2">
                Cooks
              </h3>
              <hr className="border-t-1 text-orange-400 mb-4" />
              <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="px-6 py-4 text-left font-semibold">
                        User Type
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        User ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.cooks.map((cook) => (
                      <tr
                        key={cook.userId}
                        className="hover:bg-orange-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-orange-700 font-medium">
                          Cook
                        </td>
                        <td className="px-6 py-4 text-orange-800 font-medium">
                          {cook.name}
                        </td>
                        <td className="px-6 py-4 text-orange-600 font-medium">
                          {cook.userId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Waiters
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {totalWaiters}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Cooks
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {totalCooks}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Managers
                </h3>
                <p className="text-3xl font-bold text-teal-600">
                  {totalManagers}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
