import { Layers, FileText, Ruler } from "lucide-react";
import React from "react";
import { Link } from "react-router"; // Changed to react-router

const ProductCard = ({ product, warehouseId }) => {
  // Updated getStockColor to work with stockStatus string
  const getStockColor = (status) => {
    switch (status) {
      case "OK":
        return "bg-[var(--color-success-light)] text-[var(--color-success)]";
      case "Low": // Backend sends "Low"
      case "Medium": // Backend sends "Medium"
        return "bg-[var(--color-warning-light)] text-[var(--color-warning)]";
      case "No Stock": // Backend sends "No Stock"
        return "bg-[var(--color-danger-light)] text-[var(--color-danger)]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatQuantity = (num) => {
    if (typeof num !== "number") {
      return num;
    }
    // Return number with a maximum of 3 decimal places
    const formatted = parseFloat(num.toFixed(3));
    return formatted;
  };

  const formatSize = (product) => {
    const parts = [];
    if (product.thickness) parts.push(`${product.thickness}mm`);
    if (product.width) parts.push(`${product.width}mm`);
    if (product.length) parts.push(`${product.length}mm`);
    return parts.join(" x ");
  };

  return (
    <Link to={`/stock/${warehouseId}/product/${product._id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {product.category?.name || "N/A"}
            </p>
          </div>
          {/* Updated stock status badge */}
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockColor(
              product.stockStatus
            )}`}
          >
            {product.stockStatus || "N/A"}
          </span>
        </div>

        <div className="space-y-2 mb-3 flex-grow">
          <div className="flex items-center gap-2 text-gray-600">
            <Ruler size={12} className="sm:hidden flex-shrink-0" />
            <Ruler size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              Size: {formatSize(product)}
            </span>
          </div>

          {/* Replaced Color with LC Number */}
          <div className="flex items-center gap-2 text-gray-600">
            <FileText size={12} className="sm:hidden flex-shrink-0" />
            <FileText size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              LC: {product.LC?.basicInfo?.lcNumber || "N/A"}
            </span>
          </div>

          {/* Formatted Quantity */}
          <div className="flex items-center gap-2 text-gray-600">
            <Layers size={12} className="sm:hidden flex-shrink-0" />
            <Layers size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              Qty: {formatQuantity(product.quantity)} {product.unit?.name}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Unit Price</span>
            <span className="font-semibold text-gray-900 text-sm">
              {product.unitPrice
                ? `৳${product.unitPrice.toLocaleString()}`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;
