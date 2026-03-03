import React, { memo } from "react";
import PropTypes from "prop-types";
import { useSettings } from "@/context/SettingsContext";
import ValueSkeleton from "./ValueSkeleton";

const DataField = ({
  label,
  value,
  icon: Icon,
  hidden = false,
  className = "",
  type = "text",
  format,
  loading = false,
}) => {
  const { formatCurrency, formatDate, formatNumber } = useSettings();

  if (
    !loading &&
    (hidden || value === null || value === undefined || value === "")
  ) {
    return null;
  }

  let displayValue = value;

  // Apply formatting if specified
  if (format === "currency") {
    displayValue = formatCurrency(value);
  } else if (format === "date") {
    displayValue = formatDate(value);
  } else if (format === "number") {
    displayValue = formatNumber(value);
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
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium hover:underline truncate block"
        >
          {displayValue}
        </a>
      ) : (
        <div
          className={`text-gray-900 font-medium truncate ${type === "email" || type === "tel"
              ? "text-[var(--color-primary)] hover:underline cursor-pointer"
              : ""
            }`}
          onClick={
            type === "email"
              ? () => (window.location.href = `mailto:${value}`)
              : type === "tel"
                ? () => (window.location.href = `tel:${value}`)
                : undefined
          }
        >
          {loading ? (
            <ValueSkeleton width="w-2/3" height="h-5" className="mt-1" />
          ) : (
            displayValue
          )}
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
