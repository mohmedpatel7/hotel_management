"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FiHome,
  FiPieChart,
  FiCoffee,
  FiClipboard,
  FiMenu,
  FiX,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiUsers,
  FiGrid,
  FiFileText,
  FiChevronRight,
  FiSettings,
} from "react-icons/fi";
import { useToast } from "@/components/Toast";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to true for mobile-first rendering
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const [isManger, setIsManger] = useState(false);
  const [isCook, setIsCook] = useState(false);
  const [isWaiter, setIsWaiter] = useState(false);

  // Handle responsive state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsManger(!!localStorage.getItem("manager_token"));
      setIsCook(!!localStorage.getItem("cook_token"));
      setIsWaiter(!!localStorage.getItem("weater_token"));
    }
  }, [pathname]);

  const menuItems: MenuItem[] = [
    { path: "/", name: "Home", icon: <FiHome /> },
    { path: "/dashboardManager", name: "Dashboard", icon: <FiPieChart /> },
    { path: "/menuList", name: "Menu List", icon: <FiCoffee /> },
    { path: "/reportsManager", name: "Analytics", icon: <FiClipboard /> },
    { path: "/tablesDashboard", name: "Tables", icon: <FiGrid /> },
    { path: "/billDashboard", name: "Invoices", icon: <FiFileText /> },
    { path: "/userCreation", name: "Staff Management", icon: <FiUsers /> },
  ];

  const waiterMenuItems: MenuItem[] = [
    { path: "/waiterTable", name: "Tables", icon: <FiGrid /> },
    { path: "/waiterMenu", name: "Menu", icon: <FiCoffee /> },
    {
      path: "/waiterOrderHistory",
      name: "Order History",
      icon: <FiClipboard />,
    },
  ];

  const cookMenuItems: MenuItem[] = [
    { path: "/cookDashboard", name: "Kitchen Hub", icon: <FiPieChart /> },
    { path: "/cookMenu", name: "Menu Items", icon: <FiCoffee /> },
  ];

  const sidebarVariants: Variants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const handleLinkClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setIsOpen(false);
  };

  const NavItem = ({ item }: { item: MenuItem }) => {
    const isActive = pathname === item.path;
    return (
      <motion.li variants={itemVariants}>
        <Link
          href={item.path}
          onClick={handleLinkClick}
          className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
            isActive
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-xl transition-transform duration-300 ${
                isActive ? "scale-110" : "group-hover:scale-110"
              }`}
            >
              {item.icon}
            </span>
            <span className="font-medium text-sm tracking-wide">
              {item.name}
            </span>
          </div>
          {isActive && (
            <motion.div layoutId="activeIndicator">
              <FiChevronRight className="text-white/70" />
            </motion.div>
          )}
        </Link>
      </motion.li>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-[60] p-3 rounded-2xl bg-[#1d1917] border border-white/10 text-white shadow-xl md:hidden hover:bg-orange-500 transition-colors duration-300"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[40] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={isMobile ? (isOpen ? "open" : "closed") : "open"}
        variants={sidebarVariants}
        className={`fixed left-0 top-0 h-screen w-72 bg-[#0c0a09] text-white shadow-2xl flex flex-col z-50 overflow-hidden border-r border-white/5`}
      >
        {/* Logo Section */}
        <div className="p-8">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#1d1917] p-5 rounded-[1.5rem] border border-white/5 shadow-inner">
              <h2 className="text-xl font-black text-center tracking-tighter">
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  HOTEL MUMTAZ
                </span>
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-orange-500/50" />
                <span className="text-[10px] font-bold text-orange-400 tracking-[0.3em] uppercase">
                  Chicken
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-orange-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            <ul className="space-y-2">
              {isManger
                ? menuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))
                : menuItems
                    .filter((item) => item.path === "/")
                    .map((item) => <NavItem key={item.path} item={item} />)}

              {isWaiter && (
                <>
                  <div className="pt-4 pb-2 px-4">
                    <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                      Waiter Panel
                    </span>
                  </div>
                  {waiterMenuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </>
              )}

              {isCook && (
                <>
                  <div className="pt-4 pb-2 px-4">
                    <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                      Kitchen Panel
                    </span>
                  </div>
                  {cookMenuItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                  ))}
                </>
              )}
            </ul>
          </motion.nav>
        </div>

        {/* Profile/Auth Section */}
        <div className="p-4 mt-auto">
          <div className="bg-[#1d1917] rounded-[2rem] p-3 border border-white/5">
            {isManger || isCook || isWaiter ? (
              <div className="space-y-2">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <FiUser className="text-white text-xl" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white tracking-wide">
                        Account
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Manage Profile
                      </p>
                    </div>
                  </div>
                  <FiChevronRight
                    className={`text-gray-500 transition-transform duration-300 ${
                      showProfileMenu ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pt-1">
                        {(isManger || isCook || isWaiter) && (
                          <Link
                            href={
                              isManger
                                ? "/managerProfile"
                                : isCook
                                ? "/cookProfile"
                                : "/waiterProfile"
                            }
                            className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                          >
                            <FiSettings size={14} /> Profile Settings
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            localStorage.removeItem("manager_token");
                            localStorage.removeItem("cook_token");
                            localStorage.removeItem("weater_token");
                            window.dispatchEvent(new Event("storage"));
                            showToast("Sign out Successfully.", "error");
                            router.push("/");
                            handleLinkClick();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <FiLogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/signinLandPage"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-[1.5rem] bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <FiLogIn size={18} />
                <span>Sign In to System</span>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
