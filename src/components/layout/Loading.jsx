import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Minimal dual ring spinner */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring - thinner and subtle */}
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 border-r-gray-700"></div>
          
          {/* Subtle inner ring */}
          <div className="absolute h-6 w-6 rounded-full border border-gray-200"></div>
        </div>

        {/* Simple text */}
        <p className="text-sm font-medium text-gray-600 tracking-wide">
          {text}
        </p>
      </div>
    </div>
  );
};

export default Loader;