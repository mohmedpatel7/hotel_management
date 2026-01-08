"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-white",
          border: "border-green-100",
          icon: <FiCheckCircle className="text-green-500" />,
          accent: "bg-green-500",
          shadow: "shadow-green-100",
        };
      case "error":
        return {
          bg: "bg-white",
          border: "border-red-100",
          icon: <FiAlertCircle className="text-red-500" />,
          accent: "bg-red-500",
          shadow: "shadow-red-100",
        };
      case "warning":
        return {
          bg: "bg-white",
          border: "border-yellow-100",
          icon: <FiAlertTriangle className="text-yellow-500" />,
          accent: "bg-yellow-500",
          shadow: "shadow-yellow-100",
        };
      default:
        return {
          bg: "bg-white",
          border: "border-blue-100",
          icon: <FiInfo className="text-blue-500" />,
          accent: "bg-blue-500",
          shadow: "shadow-blue-100",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={`pointer-events-auto relative group flex items-center gap-4 min-w-[320px] max-w-md p-5 rounded-3xl ${styles.bg} border ${styles.border} shadow-2xl ${styles.shadow} overflow-hidden`}
              >
                {/* Accent Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.accent}`}
                />

                {/* Icon */}
                <div className="flex-shrink-0 text-2xl">{styles.icon}</div>

                {/* Message */}
                <div className="flex-1 mr-2">
                  <p className="text-gray-800 font-bold leading-tight">
                    {toast.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <FiX className="text-lg" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
