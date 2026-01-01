import React from "react";
import { 
  Building, 
  Smartphone, 
  Wallet, 
  CreditCard,
  Landmark,
  Smartphone as Mobile,
  Banknote
} from "lucide-react";

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
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr
                key={transaction._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(transaction._id)}
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
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.transactionType === "Income" ? "+ " : "- "}৳
                  {transaction.amount.toLocaleString()}
                </td>
                
                {/* Payment Method Column */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    {/* Payment method with icon */}
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        transaction.paymentMethod === "Bank"
                          ? "bg-blue-50 text-blue-600"
                          : transaction.paymentMethod === "Mobile Banking"
                          ? "bg-purple-50 text-purple-600"
                          : transaction.paymentMethod === "Cash"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-50 text-gray-600"
                      }`}>
                        {getPaymentIcon(transaction.paymentMethod)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.paymentMethod}
                        </span>
                        {/* Show account on extra small screens when account column is hidden */}
                        <div className="text-xs text-gray-600 xs:hidden line-clamp-1 mt-0.5">
                          {getAccountDisplayName(transaction.accountId)}
                        </div>
                      </div>
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
                    <span>{new Date(transaction.date).toLocaleDateString("en-GB")}</span>
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