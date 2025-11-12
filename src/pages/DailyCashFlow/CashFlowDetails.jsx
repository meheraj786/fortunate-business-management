import React from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";

const StatCard = ({ title, amount, icon: Icon, color = "blue", subtitle }) => (
  <div
    className={`bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-${color}-500`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </p>
        <p className={`text-lg sm:text-2xl font-bold mt-1 text-${color}-600`}>
          ৳{amount?.toLocaleString()}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 sm:p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const TransactionCard = ({ transaction, iconComponents }) => {
  const IconComponent = iconComponents[transaction.icon] || Receipt;
  const isIncome = transaction.type === "income";
  const color = isIncome ? "green" : "red";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-${color}-500 mb-4`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 bg-${color}-100 rounded-full`}>
            <IconComponent className={`w-4 h-4 text-${color}-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {transaction.description}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {transaction.category} • {transaction.time}
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
              {transaction.paymentMethod}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold text-${color}-600`}>
            {isIncome ? "+" : "-"}৳{transaction.amount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const CashFlowDetails = ({
  openingBalance,
  totalIncome,
  totalExpenses,
  runningBalance,
  transactions,
  currentPage,
  totalPages,
  setCurrentPage,
  iconComponents,
  filteredTransactions,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
          subtitle={`${
            filteredTransactions.filter((t) => t.type === "income").length
          } transactions`}
        />
        <StatCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={TrendingDown}
          color="red"
          subtitle={`${
            filteredTransactions.filter((t) => t.type === "expense").length
          } transactions`}
        />
        <StatCard
          title="Running Balance"
          amount={runningBalance}
          icon={DollarSign}
          color={runningBalance >= 0 ? "purple" : "red"}
          subtitle="Current cash in hand"
        />
      </div>

      <div className="bg-white mt-4 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Today's Transactions
          </h2>
        </div>
        <div className="md:hidden">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction._id}
              transaction={transaction}
              iconComponents={iconComponents}
            />
          ))}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => {
                const Icon = iconComponents[transaction.icon];
                const isIncome = transaction.type === "income";
                return (
                  <tr key={transaction._id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {Icon && (
                          <Icon className="w-5 h-5 text-gray-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-900">
                          {transaction.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.time}
                    </td>
                    <td
                      className={`px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        isIncome ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"} ৳
                      {transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * 10, filteredTransactions.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium">{filteredTransactions.length}</span>{" "}
            results
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-l-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1 border-t border-b border-gray-300 text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-r-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowDetails;
