import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useProductSalesHistory } from "@/api/hooks/products";
import Pagination from "@/components/ui/Pagination";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const formatNumber = (num) => {
  if (typeof num !== "number") return num;
  return parseFloat(num.toFixed(3));
};

const getStatusBadge = (status, type) => {
  const styles = {
    invoice: {
      Invoiced: "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]",
      "Not Invoiced": "bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]",
    },
    payment: {
      "Paid Payment": "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]",
      "Due Payment": "bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]",
      "N/A": "bg-gray-100 text-gray-800 border border-gray-200",
    },
  };
  const styleMap = type === "invoice" ? styles.invoice : styles.payment;
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleMap[status] || styleMap["N/A"]
    }`;
};

const NoDataMessage = () => (
  <div className="text-center py-8 text-gray-500">
    No sales data available for this product.
  </div>
);

const SalesTableRow = ({ sale, productId, currentWarehouseId }) => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  // Find ALL matching items for this product in the sale
  // (a product could appear multiple times with different prices/remarks)
  const matchingItems = sale.items?.filter(i => {
    const itemProductId = i.product?._id || i.product;
    return itemProductId === productId;
  }) || [];

  let quantity, price, unitName, lineTotal;

  if (matchingItems.length > 1) {
    // Multiple entries of same product — aggregate
    quantity = matchingItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
    lineTotal = matchingItems.reduce((sum, i) => sum + (i.total || (i.quantity * i.pricePerUnit) || 0), 0);
    // Weighted average price
    price = quantity > 0 ? lineTotal / quantity : 0;
    unitName = matchingItems[0]?.unit?.name || "";
  } else if (matchingItems.length === 1) {
    // Single matching item
    const item = matchingItems[0];
    quantity = item.quantity || 0;
    price = item.pricePerUnit || 0;
    unitName = item.unit?.name || "";
    lineTotal = item.total || (quantity * price);
  } else {
    // Legacy fallback — root-level fields
    quantity = sale.quantity || 0;
    price = sale.pricePerUnit || 0;
    unitName = sale.unit?.name || "";
    lineTotal = quantity * price;
  }

  const saleWarehouseName = sale.warehouse?.name || "—";
  const isFromDifferentWarehouse = sale.warehouse?._id && sale.warehouse._id !== currentWarehouseId;

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/sales/${sale._id}`)}
    >
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(sale.saleDate)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {sale.customer?.name || "N/A"}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatNumber(quantity)} {unitName}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(price)}
        {matchingItems.length > 1 && (
          <span className="block text-xs text-gray-400 italic">avg</span>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(lineTotal)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={isFromDifferentWarehouse ? "text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200" : ""}>
          {saleWarehouseName}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={getStatusBadge(sale.invoiceStatus, "invoice")}>
          {sale.invoiceStatus}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={getStatusBadge(sale.paymentStatus, "payment")}>
          {sale.paymentStatus}
        </span>
      </td>
    </tr>
  );
};



const SalesHistory = ({ warehouseId, productId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: salesData,
    isLoading,
    isError,
  } = useProductSalesHistory(warehouseId, productId, {
    page: currentPage,
    limit: 10,
  });

  const { sales = [], totalPages = 0, totalItems = 0 } = salesData?.data || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading Sales History...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading sales history.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Sales History</h2>
        {totalItems > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Showing {sales.length} of {totalItems} sale
            {totalItems !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        {sales.length > 0 ? (
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Date",
                  "Customer",
                  "Qty",
                  "Price/Unit",
                  "Total (Product)",
                  "Warehouse",
                  "Invoice Status",
                  "Payment Status",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sales.map((sale) => (
                <SalesTableRow key={sale._id} sale={sale} productId={productId} currentWarehouseId={warehouseId} />
              ))}
            </tbody>
          </table>
        ) : (
          <NoDataMessage />
        )}
      </div>
      {totalItems > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            totalItems={totalItems}
            itemsPerPage={10}
          />
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
