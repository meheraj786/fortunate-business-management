import React from "react";
import PropTypes from "prop-types";
import { Wallet, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
import Skeleton from "react-loading-skeleton";

const DailyCashStats = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-5">
            <Skeleton height={20} width="50%" />
            <Skeleton height={30} width="70%" className="mt-2" />
            <Skeleton height={15} width="40%" className="mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
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
      />
      <StatCard
        title="Total Income"
        amount={totalIncome}
        icon={TrendingUp}
        color="green"
        subtitle={`${incomeTransactionsCount || 0} transactions`}
      />
      <StatCard
        title="Total Expenses"
        amount={totalExpenses}
        icon={TrendingDown}
        color="red"
        subtitle={`${expenseTransactionsCount || 0} transactions`}
      />
      <StatCard
        title="Running Balance"
        amount={runningBalance}
        icon={DollarSign}
        color={runningBalanceColor}
        subtitle="Current cash in hand"
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

export default DailyCashStats;
