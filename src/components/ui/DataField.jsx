import React, { memo } from "react";
import PropTypes from "prop-types";

const DataField = ({
  label,
  value,
  icon: Icon,
  hidden = false,
  className = "",
  type = "text",
  format,
}) => {
  if (hidden || value === null || value === undefined || value === "") {
    return null;
  }

  let displayValue = value;

  // Apply formatting if specified
  if (format === "currency") {
    displayValue = `৳${parseFloat(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else if (format === "date") {
    try {
      displayValue = new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      displayValue = value;
    }
  } else if (format === "number") {
    displayValue = Number(value).toLocaleString("en-IN");
  }

  return (
    <div className={`mb-3 last:mb-0 ${className}`}>
      <div className="flex items-center text-sm text-gray-500 mb-1">
        {Icon && <Icon className="mr-2 w-4 h-4" aria-hidden="true" />}
        {label}
      </div>
      {type === "link" ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#003b75] hover:text-blue-800 font-medium hover:underline truncate block"
        >
          {displayValue}
        </a>
      ) : (
        <div
          className={`text-gray-900 font-medium truncate ${
            type === "email"
              ? "text-blue-600 hover:underline cursor-pointer"
              : ""
          }`}
          onClick={
            type === "email"
              ? () => (window.location.href = `mailto:${value}`)
              : undefined
          }
        >
          {displayValue}
        </div>
      )}
    </div>
  );
};

DataField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  icon: PropTypes.elementType,
  hidden: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(["text", "email", "tel", "link"]),
  format: PropTypes.oneOf(["currency", "date", "number"]),
};

export default memo(DataField);
