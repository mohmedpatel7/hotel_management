"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getManagerProfile } from "@/Redux/slices/Manager";
import { FaUserCircle, FaIdBadge } from "react-icons/fa"; // Import icons
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/Redux/store/store";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId, name, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  const router = useRouter();
  const { showToast } = useToast();

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

  const fetchProfile = async () => {
    try {
      if (isManager) {
        dispatch(getManagerProfile());
      }
    } catch (err) {
      console.error("Error fetching manager profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [dispatch]);

  if (loading) {
    return (
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading manager profile...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
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
            {typeof error === "string" ? error : error || "Unknown error"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#ffffff] min-h-screen w-full p-6">
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-lg shadow-md p-6 mt-9 text-white">
        <h1 className="text-3xl font-bold mb-4">Manager Profile</h1>
        {userId && name ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center gap-3">
              <FaUserCircle className="text-4xl" />
              <div>
                <p className="text-lg font-semibold">Name:</p>
                <p className="text-xl font-bold">{name}</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center gap-3">
              <FaIdBadge className="text-4xl" />
              <div>
                <p className="text-lg font-semibold">User ID:</p>
                <p className="text-xl font-bold">{userId}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white">No manager profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
