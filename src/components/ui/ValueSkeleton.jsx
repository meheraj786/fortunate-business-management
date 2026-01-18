import React from "react";
import { clsx } from "clsx";

const ValueSkeleton = ({ className, width = "w-20", height = "h-4" }) => {
  return (
    <div
      className={clsx(
        "inline-block animate-pulse bg-gray-200 rounded-md align-middle",
        width,
        height,
        className,
      )}
    />
  );
};

export default ValueSkeleton;
