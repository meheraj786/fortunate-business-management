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
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

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
  const handleRowClick = (transactionId) => {
    if (onRowClick) {
      onRowClick(transactionId);
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] lg:min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {/* Description/Source - Always visible */}
            <th className="px-4 pr-0 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[220px]">
              Description
            </th>

            {/* Category - Hidden on small screens, visible on medium+ */}
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Category
            </th>

            {/* Amount - Always visible */}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Amount
            </th>

            {/* Payment Method - Always visible */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Payment
            </th>

            {/* Account - Hidden on extra small, visible on small+ */}
            <th className="hidden xs:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[220px]">
              Account
            </th>

            {/* Date - Always visible but compact */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Date
            </th>
          </tr>
        </thead>
        <AnimatePresence>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <motion.tr
                key={transaction._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(transaction._id)}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={rowVariants}
                transition={{ duration: 0.2, delay: index * 0.03 }} // Staggered animation
              >
                {/* Description/Source Column */}
                <td className="px-4 pr-0 py-3">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.source}
                    </div>
                  </div>
                </td>

                {/* Category Column - Hidden on small screens */}
                <td className="hidden sm:table-cell px-4 py-3">
                  <span className="text-sm text-gray-700 whitespace-nowrap">
                    {transaction.category}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 sm:hidden">
                    {transaction.source}
                  </div>
                </td>

                {/* Amount Column */}
                <td
                  className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${
                    transaction.transactionType === "Income"
                      ? "text-[var(--color-success)]" // Themed success
                      : "text-[var(--color-danger)]" // Themed danger
                  }`}
                >
                  {transaction.transactionType === "Income" ? "+ " : "- "}৳
                  {transaction.amount.toLocaleString()}
                </td>

                {/* Payment Method Column */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {/* First line: Icon + Payment Method */}
                    <div className="flex items-center gap-2">
                      {/* Icon box */}
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

                      {/* Payment method text */}
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.paymentMethod}
                      </span>
                    </div>

                    {/* Second line: Other info */}
                    <div className="text-xs text-gray-600 xs:hidden line-clamp-1">
                      {getAccountDisplayName(transaction.accountId)}
                    </div>
                  </div>
                </td>

                {/* Account Column - Hidden on extra small screens */}
                <td className="hidden xs:table-cell px-4 py-3">
                  <div className="text-sm text-gray-700 line-clamp-2 min-h-[40px]">
                    {getAccountDisplayName(transaction.accountId)}
                  </div>
                </td>

                {/* Date Column - Always visible */}
                <td className="px-4 py-3">
                  <div className="flex flex-col text-sm text-gray-500 whitespace-nowrap">
                    <span>
                      {new Date(transaction.date).toLocaleDateString("en-GB")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  {/* Show category on small screens when category column is hidden */}
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
      </table>
    </div>
  );
};

export default TransactionTable;
