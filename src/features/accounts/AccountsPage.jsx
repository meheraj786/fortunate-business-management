import React, { useState, useEffect } from "react";
import {
  Building,
  Smartphone,
  Receipt,
  Plus,
  DollarSign,
  Trash,
  Wallet,
  ArrowUp,
  ArrowDown,
} from "lucide-react"; // Import necessary icons for StatBox
import { useTransactionStats } from "@/api/hooks/transaction";
import StatBox from "@/components/ui/StatBox";
import AccountList from "./AccountListPage";
import TransactionList from "./TransactionListPage";
import AddAccountForm from "./AddAccountForm";
import AddTransactionForm from "./AddTransactionFormPage";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router"; // Corrected import
// import Skeleton from "react-loading-skeleton"; // Removed react-loading-skeleton
import Button from "@/components/ui/Button"; // Import Button
import { motion } from "framer-motion"; // Import motion
import toast from "react-hot-toast";

// Custom Skeleton for StatBox
const StatBoxSkeleton = () => (
  // Themed skeleton color
  <div className="h-24 bg-[var(--color-neutral-200)] rounded-lg animate-pulse"></div>
);

const Accounts = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { data: transactionStatsResponse, isLoading: isLoadingStats } =
    useTransactionStats();
  const transactionStats = transactionStatsResponse?.data;

  // State for controlling modals
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [preselectedAccountType, setPreselectedAccountType] = useState("Bank");
  const [editingAccount, setEditingAccount] = useState(null);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);

  useEffect(() => {
    if (!hasPermission("ACCOUNT_VIEW_ALL")) {
      toast.error("You don't have permission to view accounts.");
      navigate("/");
    }
  }, [hasPermission, navigate]);

  // Handlers for Add/Edit Account Form
  const handleEditClick = (account) => {
    setEditingAccount(account);
    setIsAccountFormOpen(true);
  };

  const handleOpenAddAccountForm = (accountType) => {
    setEditingAccount(null);
    setPreselectedAccountType(accountType);
    setIsAccountFormOpen(true);
  };

  const handleAccountFormSuccess = () => {
    setIsAccountFormOpen(false);
    setEditingAccount(null);
  };

  // Handler for Transaction Form
  const handleTransactionFormSuccess = () => {
    setIsTransactionFormOpen(false);
  };

  const renderTransactionStats = () => {
    if (isLoadingStats) {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatBoxSkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <StatBox
          title="Total Transactions"
          number={transactionStats?.totalTransactionsCount || 0}
          Icon={Receipt}
          textColor="primary" // Changed from blue
        />
        <StatBox
          title="Total Amount"
          number={`৳${(transactionStats?.totalAmount || 0).toLocaleString()}`}
          Icon={DollarSign}
          textColor="success" // Changed from green
        />
        <StatBox
          title="Bank Transfers"
          number={transactionStats?.totalBankTransactionCount || 0}
          Icon={Building}
          textColor="primary" // Changed from blue
        />
        <StatBox
          title="Mobile Banking"
          number={transactionStats?.totalMobileBankingTransactionCount || 0}
          Icon={Smartphone}
          textColor="primary" // Changed from purple
        />
      </div>
    );
  };

  return (
    <motion.div>
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Accounts & Transactions
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage bank, mobile, and cash accounts, and track transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasPermission("TRANSACTION_CREATE") && (
                <Button
                  onClick={() => setIsTransactionFormOpen(true)}
                  variant="success" // Changed from native button with bg-green-600
                  size="sm"
                  className="flex items-center gap-2 justify-center" // Added justify-center for mobile
                  aria-label="Add new transaction"
                >
                  <Plus className="w-4 h-4" />
                  <span> Transaction</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {hasPermission("TRANSACTION_VIEW_ALL") && renderTransactionStats()}
        {hasPermission("ACCOUNT_VIEW_ALL") && (
          <AccountList
            onEdit={handleEditClick}
            onAddAccount={handleOpenAddAccountForm}
          />
        )}
        {hasPermission("TRANSACTION_VIEW_ALL") && <TransactionList />}
      </div>

      {/* Unified Add/Edit Account Form */}
      <AddAccountForm
        isOpen={isAccountFormOpen}
        onClose={() => setIsAccountFormOpen(false)}
        editingAccount={editingAccount}
        onSuccess={handleAccountFormSuccess}
        accountType={preselectedAccountType}
      />

      {/*  Transaction Form */}
      <AddTransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        onSuccess={handleTransactionFormSuccess}
      />
    </motion.div>
  );
};

export default Accounts;
