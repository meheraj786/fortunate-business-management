import React from "react";
import { Building, Smartphone, Wallet } from "lucide-react";

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

const TransactionTable = ({ transactions, onRowClick }) => {
  const handleRowClick = (transactionId) => {
    if (onRowClick) {
      onRowClick(transactionId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description / Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr
                key={transaction._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(transaction._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.source}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {transaction.category}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                    transaction.transactionType === "Income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.transactionType === "Income" ? "+ " : "- "}৳
                  {transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.paymentMethod === "Bank"
                        ? "bg-blue-100 text-blue-800"
                        : transaction.paymentMethod === "Mobile Banking"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.paymentMethod === "Bank" && (
                      <Building className="w-3 h-3 mr-1" />
                    )}
                    {transaction.paymentMethod === "Mobile Banking" && (
                      <Smartphone className="w-3 h-3 mr-1" />
                    )}
                    {transaction.paymentMethod === "Cash" && (
                      <Wallet className="w-3 h-3 mr-1" />
                    )}
                    {transaction.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {getAccountDisplayName(transaction.accountId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-500">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
