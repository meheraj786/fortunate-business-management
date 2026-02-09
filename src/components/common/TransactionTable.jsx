import React from "react";
import {
  Building,
  Smartphone,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone as Mobile,
  Banknote,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getTransactionById } from "@/api/transaction.api";
import { memo } from "react";
import { formatAccountLabel } from "@/utils/format";

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

// getAccountDisplayName removed in favor of formatAccountLabel

const getPaymentIcon = (paymentMethod) => {
  switch (paymentMethod) {
    case "Bank":
      return <Landmark className="w-4 h-4" />;
    case "Mobile Banking":
      return <Mobile className="w-4 h-4" />;
    case "Cash":
      return <Banknote className="w-4 h-4" />;
    case "Credit Card":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <Wallet className="w-4 h-4" />;
  }
};

const TransactionTable = memo(
  ({ transactions, onRowClick, sortBy, sortOrder, onSort }) => {
    const { hasPermission } = useAuth();
    const { formatCurrency, formatDate, formatTime } = useSettings();
    const queryClient = useQueryClient();

    const prefetchTransactionDetails = (id) => {
      queryClient.prefetchQuery({
        queryKey: ["transactions", id],
        queryFn: async () => (await getTransactionById(id)).data,
        staleTime: 5 * 60 * 1000,
      });
    };

    const canViewDetails = hasPermission("TRANSACTION_VIEW_DETAILS");

    const handleRowClick = (transactionId) => {
      if (canViewDetails && onRowClick) {
        onRowClick(transactionId);
      }
    };

    return (
      <div className="-mx-4 sm:mx-0">
        {/* Mobile View - Cards */}
        <div className="block sm:hidden space-y-4 px-4 sm:px-0">
          <AnimatePresence initial={false}>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm active:bg-gray-50 transition-colors relative`}
                  onClick={() => handleRowClick(transaction._id)}
                  transition={{ duration: 0.12 }}
                  onMouseEnter={() =>
                    prefetchTransactionDetails(transaction._id)
                  }
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                          {transaction.source}
                        </span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold whitespace-nowrap ${transaction.transactionType === "Income"
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                        }`}
                    >
                      {transaction.transactionType === "Income" ? "+ " : "- "}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 sm:max-w-[60%]">
                      <div
                        className={`p-1.5 rounded-md flex-shrink-0 ${transaction.paymentMethod === "Bank"
                            ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                            : transaction.paymentMethod === "Mobile Banking"
                              ? "bg-purple-50 text-purple-600"
                              : transaction.paymentMethod === "Cash"
                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                : "bg-gray-50 text-gray-600"
                          }`}
                      >
                        {getPaymentIcon(transaction.paymentMethod)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-gray-700 truncate">
                          {formatAccountLabel(transaction.accountId)}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-600 font-medium">
                        {formatDate(transaction.date)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {formatTime(transaction.date)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                No transactions found.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-[1000px] w-full border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200"
                  >
                    <SortableHeader
                      label="Description"
                      value="description"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={onSort}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 w-32"
                  >
                    <SortableHeader
                      label="Category"
                      value="category"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={onSort}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 w-32"
                  >
                    <SortableHeader
                      label="Amount"
                      value="amount"
                      align="right"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={onSort}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 w-48"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 w-32"
                  >
                    <SortableHeader
                      label="Date"
                      value="date"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={onSort}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white relative">
                <AnimatePresence initial={false}>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <motion.tr
                        key={transaction._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-gray-50 group ${canViewDetails ? "cursor-pointer" : ""
                          }`}
                        onClick={() => handleRowClick(transaction._id)}
                        transition={{ duration: 0.12 }}
                        onMouseEnter={() =>
                          prefetchTransactionDetails(transaction._id)
                        }
                      >
                        <td className="px-5 pr-0 py-4 sm:px-4 sm:pr-0 sm:py-3 border-b border-gray-100">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.source}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 sm:px-4 sm:py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {transaction.category}
                          </span>
                        </td>

                        <td
                          className={`px-5 py-4 sm:px-4 sm:py-3 text-sm font-semibold text-right whitespace-nowrap border-b border-gray-100 ${transaction.transactionType === "Income"
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-danger)]"
                            }`}
                        >
                          {transaction.transactionType === "Income"
                            ? "+ "
                            : "- "}
                          {formatCurrency(transaction.amount)}
                        </td>

                        <td className="px-5 py-4 sm:px-4 sm:py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-md flex-shrink-0 ${transaction.paymentMethod === "Bank"
                                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                  : transaction.paymentMethod ===
                                    "Mobile Banking"
                                    ? "bg-purple-50 text-purple-600"
                                    : transaction.paymentMethod === "Cash"
                                      ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                      : "bg-gray-50 text-gray-600"
                                }`}
                            >
                              {getPaymentIcon(transaction.paymentMethod)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-gray-900 leading-tight">
                                {transaction.paymentMethod}
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                                {formatAccountLabel(transaction.accountId)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 sm:px-4 sm:py-3 border-b border-gray-100">
                          <div className="flex flex-col text-sm text-gray-500 whitespace-nowrap">
                            <span>{formatDate(transaction.date)}</span>
                            <span className="text-xs text-gray-400">
                              {formatTime(transaction.date)}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-500 border-b border-gray-100"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
);

export default TransactionTable;
