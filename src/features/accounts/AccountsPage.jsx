import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
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
} from "lucide-react";
import { useTransactionStats } from "@/api/hooks/transaction";
import StatBox from "@/components/ui/StatBox";
import AccountList from "./AccountListPage";
import TransactionList from "./TransactionListPage";
import AddAccountForm from "./AddAccountForm";
import AddTransactionForm from "./AddTransactionFormPage";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { showErrorToast } from "@/utils/notifications";

const Accounts = () => {
  const { hasPermission } = useAuth();
  const { formatCurrency } = useSettings();
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
      showErrorToast("You don't have permission to view accounts.");
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
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <StatBox
          title="Total Transactions"
          number={transactionStats?.totalTransactionsCount || 0}
          Icon={Receipt}
          textColor="primary"
          loading={isLoadingStats}
        />
        <StatBox
          title="Total Amount"
          number={formatCurrency(transactionStats?.totalAmount || 0)}
          Icon={DollarSign}
          textColor="success"
          loading={isLoadingStats}
        />
        <StatBox
          title="Bank Transfers"
          number={transactionStats?.totalBankTransactionCount || 0}
          Icon={Building}
          textColor="primary"
          loading={isLoadingStats}
        />
        <StatBox
          title="Mobile Banking"
          number={transactionStats?.totalMobileBankingTransactionCount || 0}
          Icon={Smartphone}
          textColor="primary"
          loading={isLoadingStats}
        />
      </div>
    );
  };

  return (
    <motion.div>
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4 sm:mb-6">
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
                  <span>Transaction</span>
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
