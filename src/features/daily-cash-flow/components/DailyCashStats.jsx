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
    totalCashIncome,
    totalCashExpenses,
    runningBalance,
    totalIncome, // Retained to calculate bank differential optionally
    totalExpenses,
    totalBusinessCashIncome,
    totalBusinessCashExpenses
  } = summary;

  const getRunningBalanceColor = () => {
    if (openingBalance === 0) return "blue"; // Avoid division by zero
    const net = (totalCashIncome || 0) - (totalCashExpenses || 0);
    if (net >= openingBalance * 0.5) return "green";
    if (net >= 0) return "blue";
    if (net >= -openingBalance * 0.5) return "orange";
    return "red";
  };

  const runningBalanceColor = getRunningBalanceColor();

  const bankIncome = totalIncome - totalBusinessCashIncome;
  const bankExpenses = totalExpenses - totalBusinessCashExpenses;
  const cashTransfersIn = (totalCashIncome || 0) - (totalBusinessCashIncome || 0);
  const cashTransfersOut = (totalCashExpenses || 0) - (totalBusinessCashExpenses || 0);

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
        title="Physical Cash In"
        amount={totalCashIncome || 0}
        icon={TrendingUp}
        color="green"
        subtitle={
          isLoading
            ? "Loading..."
            : `Bank & Mobile: ${formatCurrency(bankIncome)} | Transfers In: ${formatCurrency(cashTransfersIn)}`
        }
        loading={isLoading}
      />
      <StatCard
        title="Physical Cash Out"
        amount={totalCashExpenses || 0}
        icon={TrendingDown}
        color="red"
        subtitle={
          isLoading
            ? "Loading..."
            : `Bank & Mobile: ${formatCurrency(bankExpenses)} | Transfers Out: ${formatCurrency(cashTransfersOut)}`
        }
        loading={isLoading}
      />
      <StatCard
        title="Net Daily Cash"
        amount={runningBalance}
        icon={DollarSign}
        color={runningBalanceColor}
        subtitle={
          isLoading
            ? "Loading..."
            : "Physical Cash in Hand"
        }
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
