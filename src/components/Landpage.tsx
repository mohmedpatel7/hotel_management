"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import {
  FiCoffee,
  FiTruck,
  FiUsers,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger for mobile
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
      damping: 30,
      stiffness: 150,
      mass: 0.8, // Lighter feel
    },
  },
};

const LandingPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-50 rounded-l-[10rem] -z-10 transform translate-x-20 hidden lg:block" />
        <div className="absolute top-40 left-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60" />

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 text-center lg:text-left will-change-transform"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold text-sm"
            >
              <FiStar className="fill-current" />
              <span>Premium Dining Experience</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1]"
            >
              Experience the Taste of <br />
              <span className="text-orange-500">Mumtaz Chicken</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-500 text-xl font-medium max-w-xl mx-auto lg:mx-0"
            >
              Where tradition meets modern culinary excellence. Order your
              favorite meals with ease and experience lightning-fast delivery.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => router.push("/genralMenu")}
                className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-xl shadow-orange-200 hover:bg-orange-600 hover:shadow-orange-300 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Explore Menu{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/about")}
                className="w-full sm:w-auto bg-white text-gray-900 px-10 py-5 rounded-3xl font-black text-lg shadow-lg shadow-gray-100 border border-gray-100 hover:bg-gray-50 transition-all duration-300"
              >
                Our Story
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center lg:justify-start gap-8 pt-4"
            >
              <div className="text-center lg:text-left">
                <p className="text-3xl font-black text-gray-900">5k+</p>
                <p className="text-gray-500 font-bold">Happy Clients</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center lg:text-left">
                <p className="text-3xl font-black text-gray-900">120+</p>
                <p className="text-gray-500 font-bold">Menu Dishes</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }} // Reduced initial scale/rotate for mobile
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative hidden lg:block will-change-transform"
          >
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl shadow-orange-200 transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/food-hero.jpg"
                alt="Delicious Mumtaz Chicken"
                loading="lazy"
                className="w-full h-[600px] object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000";
                }}
              />
            </div>
            {/* Floating Card */}
            <motion.div
              animate={{ y: [0, -15, 0] }} // Reduced amplitude for mobile
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-20 flex items-center gap-4 border border-gray-100 will-change-transform"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">
                  Fastest Delivery
                </p>
                <p className="text-gray-500 text-xs font-bold">
                  Under 30 Minutes
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} // Added margin to trigger earlier
          variants={containerVariants}
          className="text-center mb-20 will-change-transform"
        >
          <motion.p
            variants={itemVariants}
            className="text-orange-500 font-black tracking-widest uppercase mb-4"
          >
            What we offer
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-black text-gray-900"
          >
            Our Premium <span className="text-orange-500">Services</span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Expert Chefs",
              desc: "Crafting delicious meals with passion, expertise and secret family recipes.",
              icon: <FiCoffee />,
              color: "bg-orange-50 text-orange-500",
            },
            {
              title: "Quick Delivery",
              desc: "Ensuring your food arrives fresh, hot and right on time to your doorstep.",
              icon: <FiTruck />,
              color: "bg-blue-50 text-blue-500",
            },
            {
              title: "Support Team",
              desc: "Always ready to assist you with any queries or special requests you may have.",
              icon: <FiUsers />,
              color: "bg-emerald-50 text-emerald-500",
            },
          ].map((service, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 hover:shadow-2xl hover:shadow-orange-100/30 transition-all duration-500 group will-change-transform"
            >
              <div
                className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500`}
              >
                {service.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 opacity-60 transform -translate-x-32 -translate-y-32" />

        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="text-center mb-20 will-change-transform"
          >
            <motion.p
              variants={itemVariants}
              className="text-orange-500 font-black tracking-widest uppercase mb-4"
            >
              Testimonials
            </motion.p>
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-black text-gray-900"
            >
              What Our <span className="text-orange-500">Guests Say</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Jane Doe",
                role: "Food Enthusiast",
                text: "Absolutely stunning service. The chicken was perfectly cooked and the flavors were beyond my expectations!",
                img: "https://i.pravatar.cc/150?u=jane",
              },
              {
                name: "John Smith",
                role: "Regular Customer",
                text: "The dining experience was exceptional! Every meal was a delight, and the variety of options was impressive.",
                img: "https://i.pravatar.cc/150?u=john",
              },
              {
                name: "Emily White",
                role: "Local Guide",
                text: "A truly relaxing atmosphere. I left feeling refreshed and rejuvenated. The perfect place for a family dinner!",
                img: "https://i.pravatar.cc/150?u=emily",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={itemVariants}
                className="bg-gray-50 p-10 rounded-[2.5rem] relative group hover:bg-white hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 border border-transparent hover:border-orange-100 will-change-transform"
              >
                <div className="flex items-center gap-4 mb-8">
                  <img
                    src={testimonial.img}
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-14 h-14 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="font-black text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 font-medium italic leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="text-orange-400 fill-current"
                      size={14}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-orange-500 rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden will-change-transform"
        >
          <div className="absolute top-0 right-0 p-20 opacity-10 transform translate-x-10 -translate-y-10">
            <FiCoffee size={300} />
          </div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black">
              Ready to taste the best?
            </h2>
            <p className="text-orange-100 text-xl font-medium max-w-2xl mx-auto">
              Join thousands of happy customers and order your favorite Mumtaz
              Chicken dish today.
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="bg-white text-orange-500 px-12 py-5 rounded-3xl font-black text-xl hover:bg-orange-50 transition-all duration-300 shadow-2xl shadow-orange-900/20"
            >
              Order Now
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
