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
      Invoiced: "bg-green-100 text-green-800 border border-green-200",
      "Not Invoiced": "bg-yellow-100 text-yellow-800 border border-yellow-200",
    },
    payment: {
      "Paid Payment": "bg-green-100 text-green-800 border border-green-200",
      "Due Payment": "bg-yellow-100 text-yellow-800 border border-yellow-200",
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

const SalesTableRow = ({ sale, productId }) => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  // Find the specific item for this product
  const item = sale.items?.find(i => (i.product?._id || i.product) === productId) || {};

  // Fallback to legacy root fields if item not found (or if it's a legacy sale record)
  const quantity = item.quantity || sale.quantity || 0;
  const price = item.pricePerUnit || sale.pricePerUnit || 0;
  const unitName = item.unit?.name || sale.unit?.name || "";
  const lineTotal = item.total || (quantity * price);

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
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(lineTotal)}
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

const MobileSalesCard = ({ sale, productId }) => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  const item = sale.items?.find(i => (i.product?._id || i.product) === productId) || {};
  const quantity = item.quantity || sale.quantity || 0;
  const price = item.pricePerUnit || sale.pricePerUnit || 0;
  const unitName = item.unit?.name || sale.unit?.name || "";
  const lineTotal = item.total || (quantity * price);

  return (
    <div
      className="border-t border-gray-200 last:border-b bg-white cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => navigate(`/sales/${sale._id}`)}
    >
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-gray-900">{sale.customer?.name || "N/A"}</div>
          <span className="text-sm text-gray-500">
            {formatDate(sale.saleDate)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Qty: {formatNumber(quantity)} {unitName}
          </span>
          <span className="text-gray-600">
            Price: {formatCurrency(price)}
          </span>
        </div>
        <div className="border-t border-gray-100 my-2"></div>
        <div className="flex justify-between items-center">
          <span className={getStatusBadge(sale.invoiceStatus, "invoice")}>
            {sale.invoiceStatus}
          </span>
          <span className={getStatusBadge(sale.paymentStatus, "payment")}>
            {sale.paymentStatus}
          </span>
        </div>
        <div className="border-t border-gray-100 my-2"></div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total (Product)</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </div>
    </div>
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
      <div className="sm:hidden">
        {sales.length > 0 ? (
          sales.map((sale) => <MobileSalesCard key={sale._id} sale={sale} productId={productId} />)
        ) : (
          <NoDataMessage />
        )}
      </div>
      <div className="hidden sm:block overflow-x-auto">
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
                <SalesTableRow key={sale._id} sale={sale} productId={productId} />
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
