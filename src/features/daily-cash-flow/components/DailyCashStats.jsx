import React from "react";
import PropTypes from "prop-types";
import { Wallet, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
// import Skeleton from "react-loading-skeleton"; // Removed react-loading-skeleton

const DailyCashStats = ({ summary, isLoading }) => {
  if (!summary && !isLoading) {
    return null;
  }

  const {
    openingBalance,
    totalIncome,
    totalExpenses,
    runningBalance,
    incomeTransactionsCount,
    expenseTransactionsCount,
  } = summary;

  const getRunningBalanceColor = () => {
    if (openingBalance === 0) return "blue"; // Avoid division by zero
    const net = totalIncome - totalExpenses;
    if (net / openingBalance >= 0.8) return "green";
    if (net / openingBalance >= 0.5) return "blue";
    if (net / openingBalance >= 0.2) return "orange";
    return "red";
  };

  const runningBalanceColor = getRunningBalanceColor();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Opening Balance"
        amount={openingBalance}
        icon={Wallet}
        color="blue"
        subtitle="Cash at start of day"
        loading={isLoading}
      />
      <StatCard
        title="Total Income"
        amount={totalIncome}
        icon={TrendingUp}
        color="green"
        subtitle={`${incomeTransactionsCount || 0} transactions`}
        loading={isLoading}
      />
      <StatCard
        title="Total Expenses"
        amount={totalExpenses}
        icon={TrendingDown}
        color="red"
        subtitle={`${expenseTransactionsCount || 0} transactions`}
        loading={isLoading}
      />
      <StatCard
        title="Running Balance"
        amount={runningBalance}
        icon={DollarSign}
        color={runningBalanceColor}
        subtitle="Current cash in hand"
        loading={isLoading}
      />
    </div>
  );
};

DailyCashStats.propTypes = {
  summary: PropTypes.shape({
    openingBalance: PropTypes.number,
    totalIncome: PropTypes.number,
    totalExpenses: PropTypes.number,
    runningBalance: PropTypes.number,
    incomeTransactionsCount: PropTypes.number,
    expenseTransactionsCount: PropTypes.number,
  }),
  isLoading: PropTypes.bool,
};

export default React.memo(DailyCashStats);
