import React from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import TransactionTable from "@/components/common/TransactionTable";
import StatCard from "./components/StatCard";

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
      There are no transactions for this day. Try adding some income or expenses
      to get started.
    </p>
  </div>
);

// Main Component
const CashFlowDetails = ({
  summary,
  transactions = [],
  onTransactionClick,
}) => {
  const getRunningBalanceColor = () => {
    if (!summary) return "blue";
    const { openingBalance, totalIncome, totalExpenses } = summary;
    const net = totalIncome - totalExpenses;
    if (net >= openingBalance * 0.8) return "green";
    if (net >= openingBalance * 0.5) return "blue";
    if (net >= openingBalance * 0.2) return "orange";
    return "red";
  };

  const runningBalanceColor = getRunningBalanceColor();

  if (!summary) {
    // Render a loading state or nothing if summary is not available
    return null;
  }

  const {
    openingBalance,
    totalIncome,
    totalExpenses,
    runningBalance,
    totalTransactions,
    totalIncomeTransactionsCount,
    totalExpenseTransactionsCount,
  } = summary;

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
          subtitle={`${totalIncomeTransactionsCount || 0} transactions`}
        />
        <StatCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={TrendingDown}
          color="red"
          subtitle={`${totalExpenseTransactionsCount || 0} transactions`}
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Today's Transactions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalTransactions || 0} total transactions
          </p>
        </div>

        {transactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <TransactionTable
            transactions={transactions}
            onRowClick={onTransactionClick}
          />
        )}
      </div>
    </div>
  );
};

CashFlowDetails.propTypes = {
  summary: PropTypes.object,
  transactions: PropTypes.array,
  onTransactionClick: PropTypes.func,
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
};

export default CashFlowDetails;
