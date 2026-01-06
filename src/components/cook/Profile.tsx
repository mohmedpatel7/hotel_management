"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "@/Redux/slices/Cook";
import { FaUserCircle, FaIdBadge } from "react-icons/fa"; // Import icons
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/Redux/store/store";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.cook
  );

  const router = useRouter();
  const { showToast } = useToast();

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

  const fetchProfile = async () => {
    try {
      if (isCook) {
        dispatch(getProfile());
      }
    } catch (err) {
      console.error("Error fetching cook profile:", err);
    }
  };

  useEffect(() => {
    if (isCook) {
      fetchProfile();
    }
  }, [dispatch, isCook]);

  if (loading) {
    return (
      <section
        className="min-h-screen px-6 py-10"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading Cook profile...</p>
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
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <FaUserCircle className="text-7xl text-white drop-shadow-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center md:text-left text-white">
              <h1 className="text-4xl font-extrabold tracking-tight">
                Cook Profile
              </h1>
              <p className="mt-1 text-orange-100">
                Overview of your account details
              </p>
            </div>
          </div>

          {/* Decorative Wave */}
          <svg
            className="w-full h-12 -mb-1"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl -mt-6 px-8 py-8">
          {user && user.name ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Card */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaUserCircle className="text-orange-500 text-3xl" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">
                      Full Name
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {user.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID Card */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaIdBadge className="text-orange-500 text-3xl" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">
                      Cook ID
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1 font-mono">
                      {user.userId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <FaUserCircle className="text-6xl text-orange-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No Cook profile data available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
