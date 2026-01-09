import React from "react";

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
