import React from "react";

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-gray-200 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="w-full sm:w-auto">{children}</div>
    </div>
  );
};

export default PageHeader;
