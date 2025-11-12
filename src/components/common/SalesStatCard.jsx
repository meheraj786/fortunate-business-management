import React from "react";
import { Link } from "react-router";

const SalesStatCard = ({ title, count, linkTo, icon, color }) => {
  const IconComponent = icon;
  return (
    <Link
      to={linkTo}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </Link>
  );
};

export default SalesStatCard;
