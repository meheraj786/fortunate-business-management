import React, { useState, useEffect, useCallback } from "react";
import { Building, Smartphone, Receipt, Plus, DollarSign, Trash } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import StatBox from "@/components/ui/StatBox";
import AccountList from "./AccountListPage";
import TransactionList from "./TransactionListPage";
import AddAccountForm from "./AddAccountForm"; // New unified form
import AddTransactionForm from "./AddTransactionFormPage";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";

const Accounts = () => {
  const {isSuperAdmin} = useAuth();
  // Unified form state
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [preselectedAccountType, setPreselectedAccountType] = useState("Bank");
  
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [transactionStats, setTransactionStats] = useState(null);

  // States for refreshing child components
  const [refreshAccountList, setRefreshAccountList] = useState(false);
  const [refreshTransactionList, setRefreshTransactionList] = useState(false);

  // Fetch Transaction Stats
  const fetchTransactionStats = useCallback(async () => {
    try {
      const response = await api.get(`/transactions/get-transaction-stats`);
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

  // Handlers for Unified Account Form
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
    setRefreshAccountList((prev) => !prev); // Trigger refresh in AccountList
    setRefreshTransactionList((prev) => !prev); // Also trigger refresh for transactions
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
              {
                isSuperAdmin && (
                  <Link to="/trash/account">
                  <button
                    onClick={() => setIsAccountFormOpen(false)}
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors justify-center text-sm"
                  >
                    <Trash/>
                    Trash Account
                  </button>
                  </Link>
                )
              }
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <StatBox
            title="Total Transactions"
            number={transactionStats?.totalTransactionsCount || 0}
            icon={Receipt}
            color="blue"
          />
          <StatBox
            title="Total Amount"
            number={`৳${(
              transactionStats?.totalAmount || 0
            ).toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatBox
            title="Bank Transfers"
            number={transactionStats?.totalBankTransactionCount || 0}
            icon={Building}
            color="blue"
          />
          <StatBox
            title="Mobile Banking"
            number={transactionStats?.totalMobileBankingTransactionCount || 0}
            icon={Smartphone}
            color="purple"
          />
        </div>

        <AccountList
          onEdit={handleEditClick}
          onAddAccount={handleOpenAddAccountForm}
          refresh={refreshAccountList}
        />

        <TransactionList refresh={refreshTransactionList} />
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
