import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  Package,
} from "lucide-react";

const StatusBadge = ({
  status,
  size = "md",
  showIcon = true,
  className = "",
}) => {
  if (!status) return null;

  const statusLower = status.toLowerCase();

  let config = {
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: Clock,
  };

  // Determine styling based on status
  if (
    statusLower.includes("active") ||
    statusLower.includes("completed") ||
    statusLower.includes("paid") ||
    statusLower.includes("invoiced")
  ) {
    config = {
      bgColor: "var(--color-success-light)",
      textColor: "var(--color-success)",
      borderColor: "border-green-200",
      icon: CheckCircle,
    };
  } else if (
    statusLower.includes("inactive") ||
    statusLower.includes("suspended") ||
    statusLower.includes("cancelled") ||
    statusLower.includes("rejected")
  ) {
    config = {
      bgColor: "var(--color-danger-light)",
      textColor: "var(--color-danger)",
      borderColor: "border-red-200",
      icon: XCircle,
    };
  } else if (
    statusLower.includes("pending") ||
    statusLower.includes("draft") ||
    statusLower.includes("due") ||
    statusLower.includes("processing")
  ) {
    config = {
      bgColor: "var(--color-warning-light)",
      textColor: "var(--color-warning)",
      borderColor: "border-orange-200",
      icon: AlertCircle,
    };
  } else if (
    statusLower.includes("shipped") ||
    statusLower.includes("delivered")
  ) {
    config = {
      bgColor: "var(--color-primary-light)",
      textColor: "var(--color-primary)",
      borderColor: "border-blue-200",
      icon: Truck,
    };
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm sm:px-2 sm:py-0.5 sm:text-xs",
    lg: "px-3 py-1 text-base sm:text-sm",
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.borderColor} font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]} ${className}`}
      aria-label={`Status: ${status}`}
    >
      {showIcon && <Icon className="mr-1.5" size={size === "sm" ? 12 : 16} />}
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
};

export default memo(StatusBadge);
