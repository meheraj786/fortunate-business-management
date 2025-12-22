import React, { useState, useEffect, useCallback } from "react";
import { Building, Smartphone, Receipt, Plus, DollarSign, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import StatBox from "@/components/ui/StatBox"; // Using common StatBox
import AccountList from "./AccountListPage";
import TransactionList from "./TransactionListPage"; // Corrected import path
import AddBankAccountForm from "./AddBankAccountFormPage";
import AddMobileAccountForm from "./AddMobileAccountFormPage";
import AddCashAccountForm from "./AddCashAccountFormPage";
import AddTransactionForm from "./AddTransactionFormPage";

const Accounts = () => {
  // Form states
  const [isBankFormOpen, setIsBankFormOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isCashFormOpen, setIsCashFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [transactionStats, setTransactionStats] = useState(null);

  // States for refreshing child components
  const [refreshAccountList, setRefreshAccountList] = useState(false);
  const [refreshTransactionList, setRefreshTransactionList] = useState(false);

  // Fetch Transaction Stats
  const fetchTransactionStats = useCallback(async () => {
    try {
      const response = await api.get(`/transactions/stats`);
      if (response.data.success) {
        setTransactionStats(response.data.data);
      } else {
        toast.error(
          response.data.message || "Failed to fetch transaction stats."
        );
      }
    } catch (error) {
      toast.error(
        "An unexpected error occurred while fetching transaction stats."
      );
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchTransactionStats();
  }, [fetchTransactionStats]);

  // Handlers for Account Forms
  const handleEditClick = (account) => {
    setEditingAccount(account);
    if (!account) {
      // If account is null, it's an add operation
      // The type is passed via onAddBank or onAddMobile from AccountList
      // These functions are handled by handleOpenAddBankForm/handleOpenAddMobileForm
      return;
    }

    // If account is not null, it's an edit operation
    if (account.accountType === "Bank") {
      setIsBankFormOpen(true);
    } else if (account.accountType === "Mobile Banking") {
      setIsMobileFormOpen(true);
    } else {
      setIsCashFormOpen(true);
    }
  };

  const handleOpenAddBankForm = () => {
    setEditingAccount(null); // Clear editing state for new account
    setIsBankFormOpen(true);
  };

  const handleOpenAddMobileForm = () => {
    setEditingAccount(null); // Clear editing state for new account
    setIsMobileFormOpen(true);
  };

  const handleOpenAddCashForm = () => {
    setEditingAccount(null); // Clear editing state for new account
    setIsCashFormOpen(true);
  };

  const handleAccountFormSuccess = () => {
    setIsBankFormOpen(false);
    setIsMobileFormOpen(false);
    setIsCashFormOpen(false);
    setEditingAccount(null);
    setRefreshAccountList((prev) => !prev); // Trigger refresh in AccountList
    fetchTransactionStats(); // Refresh stats after account changes
  };

  // Handler for Transaction Form
  const handleTransactionFormSuccess = () => {
    setIsTransactionFormOpen(false);
    setRefreshTransactionList((prev) => !prev); // Trigger refresh in TransactionList
    fetchTransactionStats(); // Refresh stats after new transaction
  };

  return (
    <div>
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Accounts & Payment Information
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage bank, mobile, and cash accounts, and track payment
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <StatBox // Using common StatBox
            title="Total Transactions"
            number={transactionStats?.overall?.totalTransactions || 0}
            icon={Receipt}
            color="blue"
          />
          <StatBox // Using common StatBox
            title="Total Amount"
            number={`৳${(
              transactionStats?.overall?.totalCredit || 0
            ).toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatBox // Using common StatBox
            title="Bank Transfers"
            number={transactionStats?.byType?.bank?.count || 0}
            icon={Building}
            color="blue"
          />
          <StatBox // Using common StatBox
            title="Mobile Banking"
            number={transactionStats?.byType?.mobileBanking?.count || 0}
            icon={Smartphone}
            color="purple"
          />
        </div>

        <AccountList
          onEdit={handleEditClick}
          onAddBank={handleOpenAddBankForm}
          onAddMobile={handleOpenAddMobileForm}
          onAddCash={handleOpenAddCashForm}
          refresh={refreshAccountList}
        />

        <TransactionList refresh={refreshTransactionList} />
      </div>

      {/* Add Bank Account Form */}
      <AddBankAccountForm
        isOpen={isBankFormOpen}
        onClose={() => setIsBankFormOpen(false)}
        editingAccount={editingAccount}
        onSuccess={handleAccountFormSuccess}
      />

      {/* Add Mobile Banking Account Form */}
      <AddMobileAccountForm
        isOpen={isMobileFormOpen}
        onClose={() => setIsMobileFormOpen(false)}
        editingAccount={editingAccount}
        onSuccess={handleAccountFormSuccess}
      />

      {/* Add Cash Account Form */}
      <AddCashAccountForm
        isOpen={isCashFormOpen}
        onClose={() => setIsCashFormOpen(false)}
        editingAccount={editingAccount}
        onSuccess={handleAccountFormSuccess}
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
