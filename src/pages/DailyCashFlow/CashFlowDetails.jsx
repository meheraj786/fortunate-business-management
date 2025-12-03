import React from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Receipt,
  AlertCircle,
} from "lucide-react";

// Stat Card Component
const StatCard = ({ title, amount, color, subtitle, icon: Icon }) => {
  const colorClasses = {
    blue: { text: "text-blue-600", bg: "bg-blue-100", border: "border-blue-500" },
    green: { text: "text-green-600", bg: "bg-green-100", border: "border-green-500" },
    red: { text: "text-red-600", bg: "bg-red-100", border: "border-red-500" },
    purple: { text: "text-purple-600", bg: "bg-purple-100", border: "border-purple-500" },
    orange: { text: "text-orange-600", bg: "bg-orange-100", border: "border-orange-500" },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${selectedColor.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${selectedColor.text} mb-1`}>
            ৳{typeof amount === "number" ? amount.toLocaleString() : "0"}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 ${selectedColor.bg} rounded-xl`}>
          {Icon && <Icon className={`w-6 h-6 ${selectedColor.text}`} />}
        </div>
      </div>
    </div>
  );
};

// Transaction Card Component for Mobile
const TransactionCard = ({ transaction, iconComponents }) => {
  const IconComponent = iconComponents[transaction.icon] || Receipt;
  const isIncome = transaction.type === "income";
  const color = isIncome ? "green" : "red";

  const colorClasses = {
    green: { text: "text-green-600", bg: "bg-green-100", border: "border-green-500" },
    red: { text: "text-red-600", bg: "bg-red-100", border: "border-red-500" },
  };

  const selectedColor = colorClasses[color];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${selectedColor.border} mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 ${selectedColor.bg} rounded-lg flex-shrink-0`}>
            <IconComponent className={`w-5 h-5 ${selectedColor.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {transaction.description || "No description"}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {transaction.category || "Uncategorized"}
              </span>
              <span className="text-xs text-gray-500">
                {transaction.time || "N/A"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Paid via: {transaction.paymentMethod || "Cash"}
            </p>
          </div>
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <p className={`text-lg font-bold ${selectedColor.text}`}>
            {isIncome ? "+" : "-"}৳{transaction.amount?.toLocaleString() || "0"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isIncome ? "Income" : "Expense"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyTransactions = () => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      <AlertCircle className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No transactions found
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
      There are no transactions for this day. Try adding some income or expenses to get started.
    </p>
  </div>
);

// Main Component
const CashFlowDetails = ({
  openingBalance,
  totalIncome,
  totalExpenses,
  runningBalance,
  transactions = [],
  currentPage,
  totalPages,
  setCurrentPage,
  iconComponents,
  filteredTransactions = [],
}) => {
  // Determine running balance color
  const getRunningBalanceColor = () => {
    if (runningBalance >= totalIncome * 0.8) return "green";
    if (runningBalance >= totalIncome * 0.5) return "blue";
    if (runningBalance >= totalIncome * 0.2) return "orange";
    return "red";
  };

  const runningBalanceColor = getRunningBalanceColor();

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Opening Balance"
          amount={openingBalance}
          icon={Wallet}
          color="blue"
          subtitle="Cash at start of day"
        />
        <StatCard
          title="Total Income"
          amount={totalIncome}
          icon={TrendingUp}
          color="green"
          subtitle={`${filteredTransactions.filter((t) => t.type === "income").length} transactions`}
        />
        <StatCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={TrendingDown}
          color="red"
          subtitle={`${filteredTransactions.filter((t) => t.type === "expense").length} transactions`}
        />
        <StatCard
          title="Running Balance"
          amount={runningBalance}
          icon={DollarSign}
          color={runningBalanceColor}
          subtitle="Current cash in hand"
        />
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Today's Transactions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredTransactions.length} total transactions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4">
          {transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            transactions.map((transaction) => (
              <TransactionCard
                key={transaction._id || transaction.id || Math.random()}
                transaction={transaction}
                iconComponents={iconComponents}
              />
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          {transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const Icon = iconComponents[transaction.icon];
                  const isIncome = transaction.type === "income";
                  const colorClass = isIncome ? "text-green-600" : "text-red-600";

                  return (
                    <tr
                      key={transaction._id || transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {Icon && (
                            <Icon className="w-5 h-5 text-gray-400 mr-3" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.category || "Uncategorized"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {transaction.time || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {transaction.paymentMethod || "Cash"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-semibold ${colorClass}`}>
                          {isIncome ? "+" : "-"} ৳
                          {transaction.amount?.toLocaleString() || "0"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isIncome ? "Income" : "Expense"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * 10, filteredTransactions.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {filteredTransactions.length}
                </span>{" "}
                transactions
              </div>

              <div className="flex items-center">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center border-t border-b border-gray-300 bg-white">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 text-sm font-medium border-x border-gray-300 ${
                          currentPage === pageNum
                            ? "bg-blue-50 text-blue-600 border-blue-500"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowDetails;