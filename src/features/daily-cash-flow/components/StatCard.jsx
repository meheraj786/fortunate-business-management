import React from "react";
import PropTypes from "prop-types";

const StatCard = ({ title, amount, color, subtitle, icon: Icon }) => {
  const colorClasses = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-500",
    },
    green: {
      text: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-500",
    },
    red: { text: "text-red-600", bg: "bg-red-100", border: "border-red-500" },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-100",
      border: "border-purple-500",
    },
    orange: {
      text: "text-orange-600",
      bg: "bg-orange-100",
      border: "border-orange-500",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${selectedColor.border} hover:shadow-md transition-shadow`}
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
        <div className={`p-3 ${selectedColor.bg} rounded-xl`}>
          {Icon && <Icon className={`w-6 h-6 ${selectedColor.text}`} />}
        </div>
      </div>
    </div>
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
