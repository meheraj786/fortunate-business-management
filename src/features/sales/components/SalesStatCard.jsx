import React from "react";
import { Link } from "react-router";

const SalesStatCard = ({ title, count, linkTo, icon, color }) => {
  const IconComponent = icon;

  // Map color prop to actual Tailwind classes
  const colorClasses = {
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
    },
    blue: {
      bg: "bg-primary-light",
      text: "text-primary",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <Link
      to={linkTo}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow block active:scale-[0.98] touch-manipulation"
      aria-label={`View ${title}`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${classes.bg} ${classes.text}`}>
          <IconComponent className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-4 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">
            {count?.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default SalesStatCard;
