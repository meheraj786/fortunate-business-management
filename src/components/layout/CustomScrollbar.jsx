import React from "react";

const CustomScrollbar = ({ children }) => {
  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      {children}
    </div>
  );
};

export default CustomScrollbar;
