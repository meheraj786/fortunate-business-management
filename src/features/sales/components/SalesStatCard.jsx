import React from "react";
import { Link } from "react-router"; // Changed to react-router
import { useSettings } from "@/context/SettingsContext";

const SalesStatCard = ({ title, count, linkTo, icon, color }) => {
  const IconComponent = icon;
  const { formatNumber } = useSettings();

  // Map color prop to actual Tailwind classes
  const colorClasses = {
    yellow: {
      bg: "bg-[var(--color-warning-light)]",
      text: "text-[var(--color-warning)]",
    },
    orange: {
      // Mapping orange to warning for consistency
      bg: "bg-[var(--color-warning-light)]",
      text: "text-[var(--color-warning)]",
    },
    green: {
      bg: "bg-[var(--color-success-light)]",
      text: "text-[var(--color-success)]",
    },
    red: {
      bg: "bg-[var(--color-danger-light)]",
      text: "text-[var(--color-danger)]",
    },
    blue: {
      // Default color if primary is meant to be blue
      bg: "bg-[var(--color-primary-light)]",
      text: "text-[var(--color-primary)]",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue; // Default to blue (primary)

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
            {formatNumber(count)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default SalesStatCard;
