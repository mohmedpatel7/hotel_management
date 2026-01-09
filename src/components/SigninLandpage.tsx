"use client";
import { useRouter } from "next/navigation";
import {
  FiShield,
  FiCoffee,
  FiUserCheck,
  FiArrowRight,
  FiLogIn,
} from "react-icons/fi";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster for mobile
      delayChildren: 0.1,
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
      damping: 25,
      stiffness: 200,
      mass: 0.8, // Lighter feel for mobile
    },
  },
};

const SigninLandpage = () => {
  const router = useRouter();

  const roles = [
    {
      title: "Manager",
      description:
        "Access the administrative dashboard to manage hotel operations.",
      icon: <FiShield className="text-blue-500 text-3xl" />,
      bgIcon: <FiShield size={120} />,
      iconBg: "bg-blue-50",
      path: "/managerSignin",
    },
    {
      title: "Cook",
      description:
        "Access the kitchen dashboard to manage orders and preparation.",
      icon: <FiCoffee className="text-orange-500 text-3xl" />,
      bgIcon: <FiCoffee size={120} />,
      iconBg: "bg-orange-50",
      path: "/cookSignin",
    },
    {
      title: "Waiter",
      description:
        "Access the service dashboard for table management and serving.",
      icon: <FiUserCheck className="text-emerald-500 text-3xl" />,
      bgIcon: <FiUserCheck size={120} />,
      iconBg: "bg-emerald-50",
      path: "/waiterSignin",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-8 will-change-transform"
    >
      <div className="max-w-7xl w-full mx-auto">
        <motion.div
          variants={itemVariants}
          className="text-center mb-16 will-change-transform"
        >
          <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiLogIn className="text-orange-500 text-4xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Welcome <span className="text-orange-500">Back</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
            Hotel Mumtaz Chicken Staff Portal. Please select your role to
            continue to your dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role) => (
            <motion.div
              key={role.title}
              variants={itemVariants}
              onClick={() => router.push(role.path)}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 cursor-pointer group hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 relative overflow-hidden will-change-transform"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                {role.bgIcon}
              </div>

              <div className="relative z-10">
                <div
                  className={`w-16 h-16 ${role.iconBg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}
                >
                  {role.icon}
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  {role.title}
                </h2>
                <p className="text-gray-500 font-medium mb-8">
                  {role.description}
                </p>
                <div className="flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
                  Sign In <FiArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SigninLandpage;
