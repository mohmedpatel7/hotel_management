"use client";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import React from "react";
import { useToast } from "@/components/Toast";

const GET_BILLS = gql`
  query getdata {
    getBill {
      _id
      billId
      tableId
      table {
        _id
        status
        number
      }
      orderIds
      orders {
        _id
        foodId
        food {
          category
          type
          foodName
        }
        quntity
        price
        weaterId
        weater {
          name
          userId
        }
        tableNo
        status
      }
      totalAmount
      createdAt
    }
  }
`;

export default function BillDashboard() {
  // const isManager = localStorage.getItem("manger_token");
  const { data, loading, error } = useQuery(GET_BILLS);

  const router = useRouter();
  const { showToast } = useToast();

  const isManager = localStorage.getItem("manager_token");
  if (!isManager) {
    router.push("/");
    showToast("Please Signin!", "error");
  }

  console.log("[BillDashboard] query state:", { data, loading, error });

  if (data) {
    console.log("[BillDashboard] data.getBill:", data);
    console.log("[BillDashboard] first bill:", data);
  }

  if (loading) {
    <section
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading Bills...</p>
        </div>
      </div>
    </section>;
  }

  if (error) {
    console.error("[BillDashboard] query error:", error);
    return <div>Error: {error.message}</div>;
  }
}
