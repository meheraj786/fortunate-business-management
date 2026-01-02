import React from "react";
import Flex from "@/components/ui/Flex";
import { motion } from "framer-motion"; // Import motion

const StatBox = ({ title, number, Icon, textColor = "default" }) => {
  const textColorClass = (() => {
    switch (textColor) {
      case "red": return "text-[var(--color-danger)]";
      case "blue": return "text-[var(--color-primary)]";
      case "green": return "text-[var(--color-success)]";
      case "yellow": return "text-[var(--color-warning)]";
      default: return "text-gray-900"; // Changed from #202224
    }
  })();
  return (
    <motion.div
      className="xl:flex-1 xl:w-auto w-full relative group hover:shadow-xl transition-shadow duration-300 cursor-pointer rounded-lg bg-white p-4"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Flex className="!justify-between relative z-10">
        <div>
          <h4 className="font-semibold mb-2 text-gray-700">{title}</h4> {/* Changed from #202224/70 */}
          <h3 className={`text-[28px] font-bold ${textColorClass}`}>
            {number}
          </h3>
        </div>
        {Icon && (
          <span className={`p-4 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg`}> {/* Changed color and rounded */}
            <Icon size={24} />
          </span>
        )}
      </Flex>
      <div className="absolute bottom-0 left-0 z-0 bg-gray-200  w-0 group-hover:w-[70%] rounded-tr-full h-[70%] transition-all duration-300"></div>
    </motion.div>
  );
};

export default StatBox;
