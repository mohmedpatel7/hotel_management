"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaChartBar,
  FaUtensils,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaUsers,
  FaTable,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { useToast } from "@/components/Toast";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  const { showToast } = useToast();

  // Guard localStorage access to avoid SSR ReferenceError
  const [isManger, setIsManger] = useState(false);
  const [isCook, setIsCook] = useState(false);
  const [isWaiter, setIsWaiter] = useState(false);

  // Listen for storage events to update auth state across tabs/windows
  useEffect(() => {
    const updateAuth = () => {
      if (typeof window !== "undefined") {
        setIsManger(!!localStorage.getItem("manager_token"));
        setIsCook(!!localStorage.getItem("cook_token"));
        setIsWaiter(!!localStorage.getItem("weater_token"));
      }
    };
    updateAuth();
    window.addEventListener("storage", updateAuth);
    return () => window.removeEventListener("storage", updateAuth);
  }, []);

  // Re-check on route change to ensure fresh state after signin/signout
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsManger(!!localStorage.getItem("manager_token"));
      setIsCook(!!localStorage.getItem("cook_token"));
      setIsWaiter(!!localStorage.getItem("weater_token"));
    }
  }, [pathname]);

  const menuItems = [
    { path: "/", name: "Home", icon: <FaHome size={18} /> },
    {
      path: "/dashboardManager",
      name: "Dashboard",
      icon: <FaChartBar size={18} />,
    },
    { path: "/menuList", name: "Menu", icon: <FaUtensils size={18} /> },
    {
      path: "/reportsManager",
      name: "Analytics",
      icon: <FaClipboardList size={18} />,
    },
    {
      path: "/tablesDashboard",
      name: "Table",
      icon: <FaTable size={18} />,
    },
    {
      path: "/billDashboard",
      name: "Bills",
      icon: <FaFileInvoiceDollar size={18} />,
    },
    {
      path: "/userCreation",
      name: "Users",
      icon: <FaUsers size={18} />,
    },
  ];

  const waiterMenuItems = [
    { path: "/waiterTable", name: "Tables", icon: <FaTable size={18} /> },
    { path: "/waiterMenu", name: "Menu", icon: <FaUtensils size={18} /> },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

  // Close sidebar on mobile after link click
  const handleLinkClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-orange-500 text-white md:hidden "
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-transparent backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-[#1d1917] text-white shadow-lg transition-transform duration-300 ease-out flex flex-col z-50
        ${
          isOpen ? "w-60 translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-60`}
      >
        {/* Logo */}
        <div className="p-4">
          <div className="mb-6 p-3 bg-gradient-to-b from-[#1d1917]-800 to-[#1d1917]-900 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-2">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
                Hotel Mumtaz
              </span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></span>
              <h3 className="text-base font-medium text-center text-orange-400 tracking-wide">
                Chicken
              </h3>
              <span className="h-px w-6 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></span>
            </div>
          </div>

          {/* Navigation for manager */}
          <nav>
            <ul className="space-y-2">
              {isManger
                ? menuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ease-out
                          ${
                            pathname === item.path
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                              : "hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-md text-gray-300"
                          }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    </li>
                  ))
                : menuItems
                    .filter((item) => item.path === "/")
                    .map((item) => (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          onClick={handleLinkClick}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ease-out
                            ${
                              pathname === item.path
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                                : "hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-md text-gray-300"
                            }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    ))}
            </ul>
          </nav>

          {/* Navigation for waiter */}
          <nav>
            <ul className="space-y-2 mt-2">
              {isWaiter &&
                waiterMenuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ease-out
                          ${
                            pathname === item.path
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                              : "hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-md text-gray-300"
                          }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        {/* Auth Section - Fixed at bottom */}
        <div className="mt-auto p-4 border-t border-gray-700">
          {isManger || isCook || isWaiter ? (
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 text-white"
              >
                <FaUserCircle size={20} />
                <span className="text-sm">My Profile</span>
              </button>
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-[#2d2927] rounded-xl shadow-lg overflow-hidden">
                  <Link
                    href="/managerProfile"
                    onClick={handleLinkClick}
                    className="block w-full px-4 py-2 text-white hover:bg-orange-500 transition-colors text-sm"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("manager_token");
                      localStorage.removeItem("cook_token");
                      localStorage.removeItem("weater_token");
                      // Dispatch storage event to trigger update in this component
                      window.dispatchEvent(new Event("storage"));
                      showToast("Sign out Successfully.", "error");
                      router.push("/");
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-orange-500 transition-colors flex items-center gap-2 text-sm"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/signinLandPage"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90 transition-opacity text-sm"
              >
                <FaSignInAlt />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
