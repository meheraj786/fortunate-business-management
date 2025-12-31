import React, { useState } from "react";
import { Building, Smartphone, Receipt, Plus, DollarSign, Trash, Wallet, ArrowUp, ArrowDown } from "lucide-react"; // Import necessary icons for StatBox
import { useTransactionStats } from "@/api/hooks/transaction";
import StatBox from "@/components/ui/StatBox";
import AccountList from "./AccountListPage";
import TransactionList from "./TransactionListPage";
import AddAccountForm from "./AddAccountForm";
import AddTransactionForm from "./AddTransactionFormPage";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import Skeleton from "react-loading-skeleton";


const Accounts = () => {
  const { isSuperAdmin } = useAuth();
  const { data: transactionStatsResponse, isLoading: isLoadingStats } = useTransactionStats();
  const transactionStats = transactionStatsResponse?.data;

  // State for controlling modals
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [preselectedAccountType, setPreselectedAccountType] = useState("Bank");
  const [editingAccount, setEditingAccount] = useState(null);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);

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
            <Skeleton key={i} height={100} borderRadius="0.5rem" />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <StatBox
          title="Total Transactions"
          number={transactionStats?.totalTransactionsCount || 0}
          Icon={Receipt}
          textColor="blue"
        />
        <StatBox
          title="Total Amount"
          number={`৳${(transactionStats?.totalAmount || 0).toLocaleString()}`}
          Icon={DollarSign}
          textColor="green"
        />
        <StatBox
          title="Bank Transfers"
          number={transactionStats?.totalBankTransactionCount || 0}
          Icon={Building}
          textColor="blue"
        />
        <StatBox
          title="Mobile Banking"
          number={transactionStats?.totalMobileBankingTransactionCount || 0}
          Icon={Smartphone}
          textColor="purple"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Accounts & Transactions
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage bank, mobile, and cash accounts, and track
                transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTransactionFormOpen(true)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors justify-center text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
              {isSuperAdmin && (
                <Link to="/trash/account">
                  <button
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors justify-center text-sm"
                  >
                    <Trash/>
                    Trash Account
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {renderTransactionStats()}

        <AccountList
          onEdit={handleEditClick}
          onAddAccount={handleOpenAddAccountForm}
        />

        <TransactionList />
      </div>

      {/* Unified Add/Edit Account Form */}
      <AddAccountForm
        isOpen={isAccountFormOpen}
        onClose={() => setIsAccountFormOpen(false)}
        editingAccount={editingAccount}
        onSuccess={handleAccountFormSuccess}
        accountType={preselectedAccountType}
      />

      {/* Add Transaction Form */}
      <AddTransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        onSuccess={handleTransactionFormSuccess}
      />
    </div>
  );
};

export default Accounts;
