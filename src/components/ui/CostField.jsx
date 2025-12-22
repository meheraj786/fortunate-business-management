import React, { memo } from "react";
import PropTypes from "prop-types";
import { DollarSign } from "lucide-react";

const CostField = ({ cost, showDetails = false, className = "" }) => {
  if (!cost) return null;

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={`mb-3 last:mb-0 ${className}`}>
      <div className="flex items-center text-sm text-gray-500 mb-1">
        <DollarSign className="mr-2 w-4 h-4" aria-hidden="true" />
        {cost.name} (BDT)
      </div>
      <div className="text-gray-900 font-medium">
        ৳{formatAmount(cost.amount)}
      </div>
      {showDetails && cost.date && (
        <div className="text-xs text-gray-500 mt-1">
          {new Date(cost.date).toLocaleDateString()}
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
