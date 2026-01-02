import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion"; // Import motion

const StatCard = ({ title, amount, color, subtitle, icon: Icon }) => {
  const colorClasses = {
    blue: {
      text: "text-[var(--color-primary)]",
      bg: "bg-[var(--color-primary-light)]",
      border: "border-[var(--color-primary)]",
    },
    green: {
      text: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success-light)]",
      border: "border-[var(--color-success)]",
    },
    red: {
      text: "text-[var(--color-danger)]",
      bg: "bg-[var(--color-danger-light)]",
      border: "border-[var(--color-danger)]",
    },
    purple: { // Remapping purple to primary for consistency
      text: "text-[var(--color-primary)]",
      bg: "bg-[var(--color-primary-light)]",
      border: "border-[var(--color-primary)]",
    },
    orange: {
      text: "text-[var(--color-warning)]",
      bg: "bg-[var(--color-warning-light)]",
      border: "border-[var(--color-warning)]",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue; // Default to blue (primary)

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${selectedColor.border} hover:shadow-md transition-shadow`}
      whileHover={{ scale: 1.01 }} // Subtle scale up on hover
      whileTap={{ scale: 0.99 }} // Subtle scale down on tap
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${selectedColor.text} mb-1`}>
            ৳{typeof amount === "number" ? amount.toLocaleString() : "0"}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 ${selectedColor.bg} rounded-lg`}>
          {Icon && <Icon className={`w-6 h-6 ${selectedColor.text}`} />}
        </div>
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
};

export default StatCard;
