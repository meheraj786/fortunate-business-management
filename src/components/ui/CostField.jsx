import React, { memo } from "react";
import PropTypes from "prop-types";
import { DollarSign } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const CostField = ({ cost, showDetails = false, className = "" }) => {
  const { formatCurrency, formatDate } = useSettings();

  if (!cost) return null;

  return (
    <div className={`mb-3 last:mb-0 ${className}`}>
      <div className="flex items-center text-sm text-gray-500 mb-1">
        <DollarSign className="mr-2 w-4 h-4" aria-hidden="true" />
        {cost.name}
      </div>
      <div className="text-gray-900 font-medium">
        {formatCurrency(cost.amount)}
      </div>
      {showDetails && cost.date && (
        <div className="text-xs text-gray-500 mt-1">
          {formatDate(cost.date)}
          {cost.paymentMethod && ` • ${cost.paymentMethod}`}
        </div>
      )}
    </div>
  );
};

CostField.propTypes = {
  cost: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    date: PropTypes.string,
    paymentMethod: PropTypes.string,
  }),
  showDetails: PropTypes.bool,
  className: PropTypes.string,
};

export default memo(CostField);
