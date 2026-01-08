"use client";
import { useRouter } from "next/navigation";
import {
  FiClipboard,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const Reports = () => {
  const router = useRouter();

  const reportCards = [
    {
      title: "Orders Reports",
      description: "Analyze daily sales, order volumes, and fulfillment status",
      icon: <FiClipboard className="text-orange-500 text-3xl" />,
      path: "/reportsManager/ordersReport",
      color: "orange",
    },
    {
      title: "Users Reports",
      description: "Manage staff records, roles, and performance metrics",
      icon: <FiUsers className="text-blue-500 text-3xl" />,
      path: "/reportsManager/userReports",
      color: "blue",
    },
    {
      title: "Revenue Reports",
      description: "Track financial growth, profits, and revenue streams",
      icon: <FiTrendingUp className="text-green-500 text-3xl" />,
      path: "/reportsManager/revenueReport",
      color: "green",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] px-4 sm:px-8 py-12 md:py-24"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              Management <span className="text-orange-500">Reports</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Access detailed insights and analytics to optimize your hotels
              operational efficiency and financial growth.
            </p>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {reportCards.map((card) => (
            <motion.div
              key={card.path}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              onClick={() => router.push(card.path)}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 cursor-pointer group hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden"
            >
              {/* Decorative Background Icon */}
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
                <div className="scale-[5]">{card.icon}</div>
              </div>

              <div className="relative z-10">
                <div
                  className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-colors duration-500 ${
                    card.color === "orange"
                      ? "bg-orange-50 group-hover:bg-orange-100"
                      : card.color === "blue"
                      ? "bg-blue-50 group-hover:bg-blue-100"
                      : "bg-green-50 group-hover:bg-green-100"
                  }`}
                >
                  {card.icon}
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-orange-500 transition-colors">
                  {card.title}
                </h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  {card.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-orange-500 transition-colors uppercase tracking-widest">
                  View Report{" "}
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Tip */}
        <motion.div
          variants={itemVariants}
          className="mt-20 text-center py-8 px-12 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-gray-200 max-w-3xl mx-auto"
        >
          <p className="text-gray-400 font-medium">
            <span className="text-orange-500 font-bold">Pro Tip:</span> Use the
            date filters within each report to compare performance across
            different time periods.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Reports;
