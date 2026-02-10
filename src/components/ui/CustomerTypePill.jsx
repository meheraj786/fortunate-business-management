import React, { memo } from "react";
import PropTypes from "prop-types";

const CustomerTypePill = ({ type, className = "" }) => {
    if (!type) return null;
    const isWholesale = type.toLowerCase() === "wholesale";
    const colorClasses = isWholesale
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : "bg-blue-100 text-blue-700 border-blue-200";
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
        >
            {type}
        </span>
    );
};

CustomerTypePill.propTypes = {
    type: PropTypes.string,
    className: PropTypes.string,
};

export default memo(CustomerTypePill);
