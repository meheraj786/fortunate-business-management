import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import api from "@/services/apiService";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const formatNumber = (num) => {
  if (typeof num !== "number") {
    return num;
  }
  // Return number with a maximum of 3 decimal places
  const formatted = parseFloat(num.toFixed(3));
  return formatted;
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
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    styleMap[status] || styleMap["N/A"]
  }`;
};

const NoDataMessage = () => (
  <div className="text-center py-8 text-gray-500">
    No sales data available for this product.
  </div>
);

const SalesTableRow = ({ sale }) => {
  const navigate = useNavigate();
  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/sales/${sale._id}`)}
    >
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(sale.saleDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {sale.customer.name}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatNumber(sale.quantity)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        ${formatNumber(sale.pricePerUnit || 0)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        ${formatNumber(sale.totalAmount)}
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

const MobileSalesCard = ({ sale }) => {
  const navigate = useNavigate();
  return (
    <div
      className="border-t border-gray-200 last:border-b bg-white cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => navigate(`/sales/${sale._id}`)}
    >
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-gray-900">{sale.customer.name}</div>
          <span className="text-sm text-gray-500">
            {new Date(sale.saleDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Qty: {formatNumber(sale.quantity)}</span>
          <span className="text-gray-600">
            Price: ${formatNumber(sale.pricePerUnit || 0)}
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
          <span className="font-medium text-gray-700">Total</span>
          <span className="font-bold text-gray-900">
            ${formatNumber(sale.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

const SalesHistory = ({ warehouseId, productId }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchSalesHistory = useCallback(
    async (page) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `/warehouse/${warehouseId}/products/${productId}/sales?page=${page}&limit=10`
        );
        const {
          sales,
          totalPages: newTotalPages,
          currentPage: newCurrentPage,
          totalItems: newTotalItems,
        } = response.data.data;

        setSales(sales);
        setTotalPages(newTotalPages);
        setCurrentPage(newCurrentPage);
        setTotalItems(newTotalItems);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message || "Failed to fetch sales history";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [warehouseId, productId]
  );

  useEffect(() => {
    if (warehouseId && productId) {
      fetchSalesHistory(currentPage);
    }
  }, [fetchSalesHistory, warehouseId, productId, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading Sales History...</span>
      </div>
    );
  }

  if (error) {
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
          sales.map((sale) => <MobileSalesCard key={sale._id} sale={sale} />)
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
                  "Total",
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
                <SalesTableRow key={sale._id} sale={sale} />
              ))}
            </tbody>
          </table>
        ) : (
          <NoDataMessage />
        )}
      </div>

      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default SalesHistory;
