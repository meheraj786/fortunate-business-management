import React from "react";
import { Link } from "react-router"; // Changed to react-router
import { Check, X, Calendar, Package, ArrowUp, ArrowDown } from "lucide-react";
import Button from "@/components/ui/Button"; // Import Button component
import { useAuth } from "@/context/AuthContext";

const SalesTable = ({ sales, sortBy, sortOrder, onSort }) => {
  const { hasPermission } = useAuth();
  const SortableHeader = ({ label, value, align = 'left' }) => {
    const isSorted = sortBy === value;

    return (
      <Button
        variant="subtle"
        onClick={() => onSort(value)}
        className={`flex items-center whitespace-nowrap hover:text-gray-700 !p-0 w-full ${
          align === 'right' ? 'justify-end' : 'justify-start'
        }`}
        aria-label={`Sort by ${label} ${
          isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''
        }`}
      >
        {label}
        {isSorted && (
          <span className="ml-1">
            {sortOrder === 'desc' ? (
              <ArrowDown size={14} aria-hidden="true" />
            ) : (
              <ArrowUp size={14} aria-hidden="true" />
            )}
          </span>
        )}
      </Button>
    );
  };

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium">No sales records found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  LC Number
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  <SortableHeader label="Quantity" value="quantity" align="right" />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  <SortableHeader label="Total" value="totalAmountToBePaid" align="right" />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Invoice Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Payment Status
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6"
                >
                  <SortableHeader label="Date" value="saleDate" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div
                      className="font-medium text-gray-900 max-w-[150px] truncate"
                      title={sale?.customer?.name}
                    >
                      {sale?.customer?.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {hasPermission("SALE_VIEW_DETAILS") ? (
                      <Link
                        to={`/sales/${sale._id}`}
                        className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                      >
                        <div
                          className="max-w-[120px] truncate"
                          title={sale?.product?.name}
                        >
                          {sale?.product?.name}
                        </div>
                      </Link>
                    ) : (
                      <div
                        className="max-w-[120px] truncate"
                        title={sale?.product?.name}
                      >
                        {sale?.product?.name}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div
                      className="max-w-[80px] truncate"
                      title={sale?.lc?.number}
                    >
                      {sale?.lc?.number || "N/A"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    {sale.quantity} {sale?.unit?.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    ${sale.pricePerUnit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 text-right">
                    $
                    {Math.floor(sale.totalAmountToBePaid || 0).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    {sale.invoiceStatus === "Invoiced" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-success-light)] text-[var(--color-success)]">
                        <Check className="w-3 h-3 mr-1" />
                        Invoiced
                      </span>
                    ) : sale.invoiceStatus === "Not-invoiced" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-danger-light)] text-[var(--color-danger)]">
                        <X className="w-3 h-3 mr-1" />
                        Not Invoiced
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                        <Calendar className="w-3 h-3 mr-1" />
                        <div
                          className="max-w-[60px] truncate"
                          title={sale.invoiceStatus}
                        >
                          {sale.invoiceStatus}
                        </div>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        sale.paymentStatus === "Paid payment"
                          ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                          : sale.paymentStatus === "Due payment"
                          ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div
                        className="max-w-[80px] truncate"
                        title={sale.paymentStatus}
                      >
                        {sale.paymentStatus}
                      </div>
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm text-gray-500 sm:pr-6">
                    {sale.saleDate
                      ? new Date(sale.saleDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
