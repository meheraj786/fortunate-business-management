import React, { memo } from "react";
import { Link, useNavigate } from "react-router"; 
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext"; 
import { useQueryClient } from "@tanstack/react-query";
import { getProductById } from "@/api/product.api";

const ProductTableRow = memo(({ product, warehouseId }) => {
  const { hasPermission } = useAuth();
  const { formatCurrency } = useSettings();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const prefetchProductDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["products", warehouseId, id],
      queryFn: async () => (await getProductById(warehouseId, id)).data,
      staleTime: 5 * 60 * 1000,
    });
  };

  const handleClick = () => {
    if (hasPermission("PRODUCT_VIEW_DETAILS")) {
      navigate(`/stock/${warehouseId}/product/${product._id}`);
    }
  };

  const getStockColor = (status) => {
    switch (status) {
      case "OK":
        return "bg-[var(--color-success-light)] text-[var(--color-success)]";
      case "Low":
      case "Medium":
        return "bg-[var(--color-warning-light)] text-[var(--color-warning)]";
      case "No Stock":
        return "bg-[var(--color-danger-light)] text-[var(--color-danger)]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatQuantity = (num) => {
    if (typeof num !== "number") {
      return num;
    }
    return parseFloat(num.toFixed(3));
  };

  const formatSize = (product) => {
    const parts = [];
    if (product.thickness) parts.push(product.thickness);
    if (product.width) parts.push(product.width);
    if (product.length) parts.push(product.length);
    return parts.join(" x ");
  };

  return (
    <tr 
      className={`group transition-colors ${hasPermission("PRODUCT_VIEW_DETAILS") ? "hover:bg-gray-50/80 cursor-pointer" : ""}`}
      onMouseEnter={() => hasPermission("PRODUCT_VIEW_DETAILS") && prefetchProductDetails(product._id)}
      onClick={handleClick}
    >
      <td className="px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex flex-col justify-center">
          <span className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors text-sm">
            {product.name}
          </span>
          <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
            {product.category?.name || "Uncategorized"}
          </span>
        </div>
      </td>
      <td className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-sm text-gray-600">
        {formatSize(product) || "-"}
      </td>
      <td className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-sm text-gray-600 font-mono">
        {product.LC?.basicInfo?.lcNumber || "-"}
      </td>
      <td className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
        {product.unitPrice ? formatCurrency(product.unitPrice) : "-"}
      </td>
      <td className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
        {formatQuantity(product.quantity)} <span className="text-gray-500 font-normal ml-1">{product.unit?.name}</span>
      </td>
      <td className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-center">
        <span
          className={`inline-flex px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded ${getStockColor(
            product.stockStatus,
          )}`}
        >
          {product.stockStatus || "N/A"}
        </span>
      </td>
      <td className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap text-right text-gray-300 group-hover:text-[var(--color-primary)] transition-colors pr-4">
        {hasPermission("PRODUCT_VIEW_DETAILS") && <ChevronRight size={16} className="inline-block" />}
      </td>
    </tr>
  );
});

export default ProductTableRow;
