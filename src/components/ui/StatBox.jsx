import React from "react";
import ValueSkeleton from "./ValueSkeleton";

const StatBox = ({
  title,
  number,
  Icon,
  textColor = "default",
  loading = false,
}) => {
  const textColorClass = (() => {
    switch (textColor) {
      case "red":
        return "text-[var(--color-danger)]";
      case "blue":
        return "text-[var(--color-primary)]";
      case "green":
        return "text-[var(--color-success)]";
      case "yellow":
        return "text-[var(--color-warning)]";
      default:
        return "text-gray-900";
    }
  })();
  return (
    <div
      className="xl:flex-1 xl:w-auto w-full relative group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer rounded-xl sm:rounded-lg bg-white p-4"
    >
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-start sm:items-center relative z-10 gap-2">
        <div className="min-w-0 flex-1 w-full sm:w-auto">
          <h4 className="font-semibold mb-1 sm:mb-2 text-base sm:text-sm text-gray-700 truncate" title={title}>
            {title}
          </h4>
          <h3 
            className={`text-[clamp(1.25rem,5vw,1.875rem)] font-bold tracking-tight truncate ${textColorClass}`}
            title={typeof number === "string" || typeof number === "number" ? number.toString() : ""}
          >
            {loading ? (
              <ValueSkeleton width="w-24" height="h-8" className="mt-1" />
            ) : (
              number
            )}
          </h3>
        </div>
        {Icon && (
          <span
            className={`p-2.5 sm:p-3 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg flex-shrink-0`}
          >
            <Icon size={24} />
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 z-0 bg-gray-100 w-0 group-hover:w-[70%] rounded-tr-full h-[70%] transition-all duration-300"></div>
    </div>
  );
};

export default StatBox;
