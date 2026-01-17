import React from "react";
import {
  Building,
  Smartphone,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone as Mobile,
  Banknote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const getAccountDisplayName = (accountId) => {
  if (!accountId) return "N/A";

  switch (accountId.accountType) {
    case "Bank":
      return `${accountId.bankName} (${accountId.accountHolderName})`;
    case "Mobile Banking":
      return `${accountId.serviceName} (${accountId.accountHolderName})`;
    case "Cash":
      return `${accountId.accountName} (${accountId.accountHolderName})`;
    default:
      return accountId.accountName || "N/A";
  }
};

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

const TransactionTable = ({ transactions, onRowClick }) => {
  const { hasPermission } = useAuth();
  const canViewDetails = hasPermission("TRANSACTION_VIEW_DETAILS");

  const handleRowClick = (transactionId) => {
    if (canViewDetails && onRowClick) {
      onRowClick(transactionId);
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
  };

  return (
    <div className="-mx-4 sm:mx-0">
      {/* Mobile View - Cards */}
      <div className="block sm:hidden space-y-3 px-4 sm:px-0">
        <AnimatePresence>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${
                  canViewDetails ? "active:bg-gray-50" : ""
                }`}
                onClick={() => handleRowClick(transaction._id)}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={rowVariants}
                transition={{ duration: 0.2, delay: index * 0.03 }}
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
                    className={`text-sm font-bold whitespace-nowrap ${
                      transaction.transactionType === "Income"
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {transaction.transactionType === "Income" ? "+ " : "- "}৳
                    {transaction.amount.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 sm:max-w-[60%]">
                    <div
                      className={`p-1.5 rounded-md flex-shrink-0 ${
                        transaction.paymentMethod === "Bank"
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
                        {getAccountDisplayName(transaction.accountId)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-600 font-medium">
                      {new Date(transaction.date).toLocaleDateString("en-GB")}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(transaction.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
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
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[700px] lg:min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 pr-0 py-4 sm:px-4 sm:pr-0 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[220px]">
                Description
              </th>
              <th className="hidden sm:table-cell px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Category
              </th>
              <th className="px-5 py-4 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Amount
              </th>
              <th className="px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Payment
              </th>
              <th className="hidden xs:table-cell px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[220px]">
                Account
              </th>
              <th className="px-5 py-4 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction._id}
                    className={`hover:bg-gray-50 ${
                      canViewDetails ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handleRowClick(transaction._id)}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <td className="px-5 pr-0 py-4 sm:px-4 sm:pr-0 sm:py-3">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.source}
                        </div>
                      </div>
                    </td>

                    <td className="hidden sm:table-cell px-5 py-4 sm:px-4 sm:py-3">
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {transaction.category}
                      </span>
                      <div className="text-xs text-gray-500 mt-1 sm:hidden">
                        {transaction.source}
                      </div>
                    </td>

                    <td
                      className={`px-5 py-4 sm:px-4 sm:py-3 text-sm font-semibold text-right whitespace-nowrap ${
                        transaction.transactionType === "Income"
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-danger)]"
                      }`}
                    >
                      {transaction.transactionType === "Income" ? "+ " : "- "}৳
                      {transaction.amount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 sm:px-4 sm:py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1 rounded-md ${
                              transaction.paymentMethod === "Bank"
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
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.paymentMethod}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 xs:hidden line-clamp-1">
                          {getAccountDisplayName(transaction.accountId)}
                        </div>
                      </div>
                    </td>

                    <td className="hidden xs:table-cell px-5 py-4 sm:px-4 sm:py-3">
                      <div className="text-sm text-gray-700 line-clamp-2 min-h-[40px]">
                        {getAccountDisplayName(transaction.accountId)}
                      </div>
                    </td>

                    <td className="px-5 py-4 sm:px-4 sm:py-3">
                      <div className="flex flex-col text-sm text-gray-500 whitespace-nowrap">
                        <span>
                          {new Date(transaction.date).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(transaction.date).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 sm:hidden mt-1">
                        {transaction.category}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
