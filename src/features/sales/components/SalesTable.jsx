import React, { memo } from "react";
import { Link } from "react-router"; // Changed to react-router
import { motion, AnimatePresence } from "framer-motion";
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
import { useAuth } from "@/hooks/useAuth";
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
  const { hasPermission } = useAuth();
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

  // Helper to calculate due amount
  const getDueAmount = (sale) => {
    const totalPaid = sale.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const due = (sale.totalAmountToBePaid || 0) - totalPaid;
    return due > 0 ? due : 0;
  };

  return (
    <div className="-mx-4 sm:mx-0">
      {/* Mobile View - Cards */}
      <div className="block sm:hidden space-y-4 px-4 sm:px-0">
        {/* Mobile Sorting Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-4 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2 flex-1">
            <Filter size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer w-full"
            >
              <option value="saleDate">Date</option>
              <option value="totalAmountToBePaid">Total Amount</option>
            </select>
          </div>
          <button
            onClick={() => onSort(sortBy)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-bold text-gray-700 shadow-sm active:scale-95 transition-all outline-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={sortOrder}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                {sortOrder === "desc" ? (
                  <>
                    <ArrowDown
                      size={14}
                      className="text-[var(--color-primary)]"
                    />
                    DESC
                  </>
                ) : (
                  <>
                    <ArrowUp
                      size={14}
                      className="text-[var(--color-primary)]"
                    />
                    ASC
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {sales.map((sale) => (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm active:bg-gray-50 transition-colors"
                transition={{ duration: 0.12 }}
                onMouseEnter={() => prefetchSaleDetails(sale._id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {sale.saleId || `#${sale._id.slice(-6)}`}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(sale.saleDate)}
                      </span>
                    </div>
                    {/* Replaced Product Name with "Items" count or generic text since we have multi-product */}
                    <Link
                      to={`/sales/${sale._id}`}
                      className="text-base font-bold text-gray-900 truncate block hover:text-[var(--color-primary)] transition-colors"
                    >
                      {sale.items?.length > 1 ? `${sale.items.length} Items` : (sale.items?.[0]?.product?.name || sale.product?.name || "Unknown Product")}
                    </Link>
                    <div className="text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      {sale.customer?.name || "Unknown Customer"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-[var(--color-primary)]">
                      {formatCurrency(sale.totalAmountToBePaid)}
                    </div>
                    <div className={`text-xs font-medium mt-1 inline-block ${sale.balanceDue > 0 ? "text-red-500" : "text-green-500"}`}>
                      Due: {formatCurrency(sale.balanceDue || 0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
                  <div className="flex gap-2">
                    {sale.invoiceStatus === "Invoiced" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--color-success-light)] text-[var(--color-success)]">
                        Invoiced
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                        {sale.invoiceStatus?.replace("-", " ") || "Pending"}
                      </span>
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${["Paid", "Paid payment", "Overpaid"].includes(sale.paymentStatus)
                          ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                          : ["Due", "Due payment", "Partial"].includes(sale.paymentStatus)
                            ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {sale.paymentStatus?.replace(" payment", "")}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop/Tablet View - Table */}
      <div className="hidden sm:block overflow-x-auto border border-gray-100 bg-white">
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
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 hidden md:table-cell border-b border-gray-200"
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
              <AnimatePresence initial={false}>
                {sales.map((sale) => (
                  <motion.tr
                    key={sale._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors group"
                    transition={{ duration: 0.12 }}
                    onMouseEnter={() => prefetchSaleDetails(sale._id)}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 border-b border-gray-100">
                      <Link
                        to={`/sales/${sale._id}`}
                        className="text-[var(--color-primary)] hover:text-[#004b95]"
                      >
                        {sale.saleId || `#${sale._id.slice(-6)}`}
                      </Link>
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
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center hidden md:table-cell border-b border-gray-100">
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
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default SalesTable;
