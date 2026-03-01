import React from "react";
import PropTypes from "prop-types";
import { Wallet, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
// import Skeleton from "react-loading-skeleton"; // Removed react-loading-skeleton

import { useSettings } from "@/context/SettingsContext";

const DailyCashStats = ({ summary, isLoading }) => {
  const { formatCurrency } = useSettings();

  if (!summary && !isLoading) {
    return null;
  }

  const {
    openingBalance,
    totalIncome,
    totalExpenses,
    runningBalance,
    totalBusinessCashIncome,
    totalBusinessCashExpenses,
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

  const bankIncome = totalIncome - totalBusinessCashIncome;
  const bankExpenses = totalExpenses - totalBusinessCashExpenses;

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
        subtitle={
          isLoading
            ? "Loading..."
            : `Cash: ${formatCurrency(totalBusinessCashIncome)} | Other: ${formatCurrency(bankIncome)}`
        }
        loading={isLoading}
      />
      <StatCard
        title="Total Expenses"
        amount={totalExpenses}
        icon={TrendingDown}
        color="red"
        subtitle={
          isLoading
            ? "Loading..."
            : `Cash: ${formatCurrency(totalBusinessCashExpenses)} | Other: ${formatCurrency(bankExpenses)}`
        }
        loading={isLoading}
      />
      <StatCard
        title="Running Balance"
        amount={runningBalance}
        icon={DollarSign}
        color={runningBalanceColor}
        subtitle="Physical Cash in Hand"
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
    totalCashIncome: PropTypes.number,
    totalCashExpenses: PropTypes.number,
    totalBusinessCashIncome: PropTypes.number,
    totalBusinessCashExpenses: PropTypes.number,
    incomeTransactionsCount: PropTypes.number,
    expenseTransactionsCount: PropTypes.number,
  }),
  isLoading: PropTypes.bool,
};

export default React.memo(DailyCashStats);
