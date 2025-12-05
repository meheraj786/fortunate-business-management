import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-slate-900/90 px-10 py-8 shadow-2xl border border-slate-700/50">
        
        {/* Simple dual ring spinner */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="h-14 w-14 animate-spin rounded-full border-3 border-slate-700 border-t-indigo-500 border-r-indigo-500"></div>
          
          {/* Center glow */}
          <div className="absolute h-8 w-8 rounded-full bg-indigo-500/20 blur-lg"></div>
        </div>

        {/* Text with animated dots */}
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-slate-300">
            {text}
          </p>
          <div className="flex gap-1">
            <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0ms' }}></span>
            <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '400ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;