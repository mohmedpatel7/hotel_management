"use client";
import { useRouter } from "next/navigation";
import { FaClipboardList, FaUsers, FaMoneyBillWave } from "react-icons/fa";

const Reports = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-[#ff5500] mb-12">
        Reports of Hotel Mumtaz Chicken
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Orders Reports Card */}
        <div
          className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            hover:scale-105 hover:bg-orange-50 cursor-pointer"
          onClick={() => router.push("/reportsManager/ordersReport")}
        >
          <div className="flex flex-col items-center">
            <FaClipboardList className="text-[#ff5500] text-5xl mb-4" />
            <h2 className="text-2xl font-semibold text-[#ff5500] mb-3">
              Orders Reports
            </h2>
            <p className="text-gray-600">View and analyze order reports</p>
          </div>
        </div>

        {/* Users Reports Card */}
        <div
          className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            hover:scale-105 hover:bg-orange-50 cursor-pointer"
          onClick={() => router.push("/reportsManager/userReports")}
        >
          <div className="flex flex-col items-center">
            <FaUsers className="text-[#ff5500] text-5xl mb-4" />
            <h2 className="text-2xl font-semibold text-[#ff5500] mb-3">
              Users Reports
            </h2>
            <p className="text-gray-600">View and analyze user reports</p>
          </div>
        </div>

        {/* Revenue Reports Card */}
        <div
          className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            hover:scale-105 hover:bg-orange-50 cursor-pointer"
          onClick={() => router.push("/reportsManager/revenueReport")}
        >
          <div className="flex flex-col items-center">
            <FaMoneyBillWave className="text-[#ff5500] text-5xl mb-4" />
            <h2 className="text-2xl font-semibold text-[#ff5500] mb-3">
              Revenue Reports
            </h2>
            <p className="text-gray-600">View and analyze revenue reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
