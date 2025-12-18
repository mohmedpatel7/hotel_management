"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUserTie, FaConciergeBell, FaUtensils } from "react-icons/fa";
import { useToast } from "@/components/Toast";

const UserCreation = () => {
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

  return (
    isManager && (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-[#ff5500] mb-12">
          Manage Accounts of Hotel Mumtaz Chicken
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            hover:scale-105 hover:bg-orange-50 cursor-pointer"
            onClick={() => router.push("/managerSignup")}
          >
            <div className="flex flex-col items-center">
              <FaUserTie className="text-[#ff5500] text-5xl mb-4" />
              <h2 className="text-2xl font-semibold text-[#ff5500] mb-3">
                Manager
              </h2>
              <p className="text-gray-600">Create Account for Hotel Manager</p>
            </div>
          </div>

          <div
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            hover:scale-105 hover:bg-orange-50 cursor-pointer"
            onClick={() => router.push("/cookSignup")}
          >
            <div className="flex flex-col items-center">
              <FaUtensils className="text-[#ff5500] text-5xl mb-4" />
              <h2 className="text-2xl font-semibold text-[#ff5500] mb-3">
                Cook
              </h2>
              <p className="text-gray-600">Create Account for Hotel Cook</p>
            </div>
          </div>

          <div
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            hover:scale-105 hover:bg-orange-50 cursor-pointer"
            onClick={() => router.push("/waiterSignup")}
          >
            <div className="flex flex-col items-center">
              <FaConciergeBell className="text-[#ff5500] text-5xl mb-4" />
              <h2 className="text-2xl font-semibold text-[#ff5500] mb-3">
                Waiter
              </h2>
              <p className="text-gray-600">Create Account for Hotel Waiter</p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default UserCreation;
