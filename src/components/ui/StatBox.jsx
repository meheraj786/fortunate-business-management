import React from "react";
import { motion } from "framer-motion";

const StatBox = ({ title, number, Icon, textColor = "default" }) => {
  const textColorClass = (() => {
    switch (textColor) {
      case "red": return "text-[var(--color-danger)]";
      case "blue": return "text-[var(--color-primary)]";
      case "green": return "text-[var(--color-success)]";
      case "yellow": return "text-[var(--color-warning)]";
      default: return "text-gray-900";
    }
  })();
  return (
    <motion.div
      className="xl:flex-1 xl:w-auto w-full relative group hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-xl sm:rounded-lg bg-white p-4"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h4 className="font-semibold mb-1 sm:mb-2 text-base sm:text-sm text-gray-700">{title}</h4>
          <h3 className={`text-4xl sm:text-3xl font-bold ${textColorClass}`}>
            {number}
          </h3>
        </div>
        {Icon && (
          <span className={`p-3 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg`}>
            <Icon size={24} />
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 z-0 bg-gray-100 w-0 group-hover:w-[70%] rounded-tr-full h-[70%] transition-all duration-300"></div>
    </motion.div>
  );
};

export default StatBox;
