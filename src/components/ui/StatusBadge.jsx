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
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: CheckCircle,
    };
  } else if (
    statusLower.includes("inactive") ||
    statusLower.includes("suspended") ||
    statusLower.includes("cancelled") ||
    statusLower.includes("rejected")
  ) {
    config = {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      icon: XCircle,
    };
  } else if (
    statusLower.includes("pending") ||
    statusLower.includes("draft") ||
    statusLower.includes("due") ||
    statusLower.includes("processing")
  ) {
    config = {
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      icon: AlertCircle,
    };
  } else if (
    statusLower.includes("shipped") ||
    statusLower.includes("delivered")
  ) {
    config = {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      icon: Truck,
    };
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]} ${className}`}
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
