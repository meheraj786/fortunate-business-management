import React, { memo } from "react";
import { Link } from "react-router"; // Changed to react-router
import {
  Check,
  X,
  Calendar,
  Package,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import Button from "@/components/ui/Button"; // Import Button component
import SelectField from "@/components/ui/SelectField";
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getSaleById } from "@/api/sales.api"; // Assuming this path for getSaleById

const SortableHeader = ({
  label,
  value,
  align = "left",
  sortBy,
  sortOrder,
  onSort,
}) => {
  const isSorted = sortBy === value;

  return (
    <button
      onClick={() => onSort(value)}
      className={`flex items-center gap-1.5 whitespace-nowrap hover:text-[var(--color-primary)] transition-colors w-full group outline-none ${align === "right" ? "justify-end text-right" : "justify-start text-left"
        }`}
      aria-label={`Sort by ${label} ${isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : ""
        }`}
    >
      <span
        className={`text-sm font-semibold ${isSorted ? "text-[var(--color-primary)]" : "text-gray-900"}`}
      >
        {label}
      </span>
      <span
        className={`flex-shrink-0 transition-opacity ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
      >
        {isSorted && sortOrder === "asc" ? (
          <ArrowUp size={14} className="text-[var(--color-primary)]" />
        ) : isSorted && sortOrder === "desc" ? (
          <ArrowDown size={14} className="text-[var(--color-primary)]" />
        ) : (
          <ArrowUpDown size={14} />
        )}
      </span>
    </button>
  );
};

const SalesTable = memo(({ sales, sortBy, sortOrder, onSort }) => {
  const { formatCurrency, formatDate } = useSettings();
  const queryClient = useQueryClient();

  const prefetchSaleDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["sales", id],
      queryFn: async () => (await getSaleById(id)).data,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
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
    <div className="-mx-4 sm:mx-0">
      {/* Desktop/Tablet View - Table */}
      <div className="overflow-x-auto border border-gray-100 bg-white">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-[1000px] w-full border-separate border-spacing-0">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 border-b border-gray-200"
                >
                  Sale ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Warehouse"
                    value="warehouseName"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Product"
                    value="productName"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Customer"
                    value="customerName"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  Due Amount
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Total"
                    value="totalAmountToBePaid"
                    align="right"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  Invoice Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  Payment Status
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-6 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Date"
                    value="saleDate"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white relative">
              {sales.map((sale) => (
                <tr
                  key={sale._id}
                  className="hover:bg-gray-50 transition-colors group"
                  onMouseEnter={() => prefetchSaleDetails(sale._id)}
                >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 border-b border-gray-100">
                      <Link
                        to={`/sales/${sale._id}`}
                        className="text-[var(--color-primary)] hover:text-[#004b95] block"
                      >
                        {sale.saleId || `#${sale._id.slice(-6)}`}
                      </Link>
                      {sale.saleId?.startsWith("OPEN-BAL-") && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] uppercase font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded">
                          Opening Balance
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-b border-gray-100">
                      <div className="max-w-[120px] truncate" title={sale?.warehouse?.name}>
                        {sale?.warehouse?.name || "N/A"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-b border-gray-100">
                      <div className="max-w-[150px] truncate" title={sale.items?.length > 1 ? "Multiple Items" : (sale.items?.[0]?.product?.name || sale.product?.name)}>
                        {sale.items?.length > 1 ? `${sale.items.length} Items` : (sale.items?.[0]?.product?.name || sale.product?.name || "Unknown Product")}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-b border-gray-100">
                      <div
                        className="max-w-[150px] truncate"
                        title={sale?.customer?.name}
                      >
                        {sale?.customer?.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-medium border-b border-gray-100">
                      {formatCurrency(sale.balanceDue || 0)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-[var(--color-primary)] text-right border-b border-gray-100">
                      {formatCurrency(sale.totalAmountToBePaid)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center border-b border-gray-100">
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
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center border-b border-gray-100">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${["Paid", "Paid payment", "Overpaid"].includes(sale.paymentStatus)
                          ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                          : ["Due", "Due payment", "Partial"].includes(sale.paymentStatus)
                            ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <div
                          className="max-w-[80px] truncate"
                          title={sale.paymentStatus}
                        >
                          {sale.paymentStatus?.replace(" payment", "")}
                        </div>
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm text-gray-500 sm:pr-6 border-b border-gray-100">
                      {formatDate(sale.saleDate)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default SalesTable;
