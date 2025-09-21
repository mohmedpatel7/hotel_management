"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaChartBar,
  FaUtensils,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { path: "/", name: "Home", icon: <FaHome size={20} /> },
    {
      path: "/dashboardManager",
      name: "Dashboard",
      icon: <FaChartBar size={20} />,
    },

    { path: "/menu", name: "Menu", icon: <FaUtensils size={20} /> },
    {
      path: "/analytics",
      name: "Analytics",
      icon: <FaClipboardList size={20} />,
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-orange-500 text-white md:hidden"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-[#1d1917] text-[#1d1917]-100 shadow-lg transition-all duration-300 flex flex-col
        ${
          isOpen ? "w-64 translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64`}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="mb-8 p-4 bg-gradient-to-b from-[#1d1917]-800 to-[#1d1917]-900 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-2">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
                Hotel Mumtaz
              </span>
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></span>
              <h3 className="text-lg font-medium text-center text-orange-400 tracking-wide">
                Chicken
              </h3>
              <span className="h-px w-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></span>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-3">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ease-in-out
                      ${
                        pathname === item.path
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                          : "hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:shadow-md text-[#1d1917]-300"
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Auth Section - Fixed at bottom */}
        <div className="mt-auto p-6 border-t border-[#1d1917]-700">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600"
              >
                <FaUserCircle size={24} />
                <span>My Profile</span>
              </button>
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-[#1d1917]-800 rounded-xl shadow-lg overflow-hidden">
                  <Link
                    href="/profile"
                    className="block w-full px-5 py-3 hover:bg-[#1d1917]-700 transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      /* Add logout logic */
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-[#1d1917]-700 transition-colors flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/signin"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 transition-opacity"
              >
                <FaSignInAlt />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-orange-500 hover:bg-orange-500/10 transition-colors"
              >
                <FaUserPlus />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
