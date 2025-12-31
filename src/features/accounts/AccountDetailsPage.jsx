import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building, Smartphone, CreditCard, DollarSign, Hash, User,
  Calendar, Info, Edit, Trash2, Wallet, Search, Filter, ArrowUp, ArrowDown, X, ChevronDown,
} from "lucide-react";
import { useAccountDetails, useDeleteAccount } from "@/api/hooks/account";
import { useAccountTransactions } from "@/api/hooks/transaction";
import toast from "react-hot-toast";

import StatBox from "@/components/ui/StatBox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddAccountForm from "./AddAccountForm";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import Skeleton from "react-loading-skeleton";

const sortOptions = [ { value: "date", label: "Date" }, { value: "amount", label: "Amount" }, { value: "category", label: "Category" }];
const transactionTypeOptions = [ { value: "all", label: "All Types" }, { value: "Income", label: "Income" }, { value: "Expense", label: "Expense" }];
const paymentMethodOptions = [ { value: "all", label: "All Methods" }, { value: "Bank", label: "Bank" }, { value: "Mobile Banking", label: "Mobile Banking" }, { value: "Cash", label: "Cash" }];

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-24 ml-auto"></div></td>
    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-32"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
  </tr>
);

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  // UI Control State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  
  // Filter and Sort states
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ transactionType: "all", paymentMethod: "all", category: "all" });
  const [sorting, setSorting] = useState({ sortBy: "date", sortOrder: "desc" });
  const [showFilters, setShowFilters] = useState(false);

  // Data Fetching via React Query
  const { data: detailsResponse, isLoading: isLoadingDetails, isError: isDetailsError } = useAccountDetails(accountId);
  const account = detailsResponse?.data?.account;
  const accountStats = detailsResponse?.data?.stats;

  const transactionParams = useMemo(() => {
    const params = { page, limit: 10, sortBy: sorting.sortBy, sortOrder: sorting.sortOrder };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (filters.transactionType !== "all") params.transactionType = filters.transactionType;
    if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
    if (filters.category !== "all") params.category = filters.category;
    return params;
  }, [page, sorting, filters, debouncedSearchTerm]);

  const { data: transResponse, isLoading: isLoadingTransactions } = useAccountTransactions(accountId, transactionParams);
  const transactions = transResponse?.data?.transactions?.docs || [];
  const transactionPagination = transResponse?.data?.transactions || {};
  const categories = transResponse?.data?.categories || [];

  // Mutations
  const deleteAccountMutation = useDeleteAccount();

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= transactionPagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };
  
  const handleSortByChange = (e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSorting((prev) => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ transactionType: "all", paymentMethod: "all", category: "all" });
    setSearchTerm("");
    setSorting({ sortBy: "date", sortOrder: "desc" });
    setShowFilters(false);
    setPage(1);
  };

  const confirmDelete = () => {
    deleteAccountMutation.mutate(accountId, {
      onSuccess: () => {
        toast.success("Account deleted successfully!");
        navigate("/accounts");
      },
    });
  };

  const handleFormSuccess = () => {
    setIsEditFormOpen(false);
  };

  const handleTransactionClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsTransactionModalOpen(true);
  };
  
  const renderStats = () => {
    if (isLoadingDetails) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Array.from({length: 6}).map((_, i) => <Skeleton key={i} height={88} borderRadius="0.75rem" />)}
        </div>
      )
    }
    if (accountStats) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatBox title="Current Balance" number={`৳${accountStats.currentBalance.toLocaleString()}`} Icon={Wallet} textColor="blue" />
          <StatBox title="Total Income" number={`৳${accountStats.totalIncome.toLocaleString()}`} Icon={ArrowUp} textColor="green" />
          <StatBox title="Total Expense" number={`৳${accountStats.totalExpense.toLocaleString()}`} Icon={ArrowDown} textColor="red" />
          <StatBox title="Largest Income" number={`৳${accountStats.largestIncome.toLocaleString()}`} Icon={ArrowUp} textColor="green" />
          <StatBox title="Largest Expense" number={`৳${accountStats.largestExpense.toLocaleString()}`} Icon={ArrowDown} textColor="red" />
          <StatBox title="Avg. Transaction" number={`৳${(accountStats.averageTransactionAmount || 0).toLocaleString()}`} Icon={DollarSign} textColor="default" />
        </div>
      );
    }
    return null;
  }

  if (isLoadingDetails) {
    return <div className="flex justify-center items-center h-96"><DollarSign className="animate-spin h-12 w-12 text-primary" /></div>;
  }

  if (isDetailsError || !account) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Account not found.</h2>
        <Link to="/accounts" className="text-primary hover:underline">Go back to Accounts</Link>
      </div>
    );
  }
  
  const isBank = account.accountType === "Bank";
  const isMobile = account.accountType === "Mobile Banking";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/accounts" className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{account.accountName}</h1>
            <p className="text-gray-600">{account.accountHolderName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditFormOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Edit size={16} /> Edit</button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><Info className="w-5 h-5 text-gray-600" /> Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2"><strong>Balance:</strong> ৳{account.balance.toLocaleString()}</div>
          <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /><strong>Holder:</strong> {account.accountHolderName}</div>
          <div className="flex items-center gap-2">
            {isBank ? <Building className="w-4 h-4 text-gray-500" /> : isMobile ? <Smartphone className="w-4 h-4 text-gray-500" /> : <Wallet className="w-4 h-4 text-gray-500" />}
            <strong>{isBank ? "Bank:" : isMobile ? "Service:" : "Account:"}</strong> {isBank ? account.bankName : isMobile ? account.serviceName : account.accountName}
          </div>
          {isBank && (
            <>
              <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-500" /><strong>A/C Number:</strong> {account.accountNumber}</div>
              <div className="flex items-center gap-2"><Info className="w-4 h-4 text-gray-500" /><strong>Branch:</strong> {account.branchName}</div>
            </>
          )}
          {isMobile && <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-500" /><strong>Mobile No:</strong> {account.mobileNumber}</div>}
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /><strong>Created At:</strong> {new Date(account.createdAt).toLocaleString("en-GB")}</div>
        </div>
      </div>

      {renderStats()}

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b"><h2 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5 text-gray-600" /> Transactions</h2><p className="text-sm text-gray-500 mt-1">View financial movements associated with this account.</p></div>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            <div className="relative w-full md:w-48">
              <select value={sorting.sortBy} onChange={handleSortByChange} className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white">
                {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>Sort by {opt.label}</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            <button onClick={toggleSortOrder} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              {sorting.sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"><Filter className="w-4 h-4" /><span>Filters</span></button>
          </div>
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filter Options</h3>
                <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"><X size={16} /> Clear</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <select name="transactionType" value={filters.transactionType} onChange={(e) => handleFilterChange("transactionType", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white">{transactionTypeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>
                <select name="paymentMethod" value={filters.paymentMethod} onChange={(e) => handleFilterChange("paymentMethod", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white">{paymentMethodOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>
                <select name="category" value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-white" disabled={categories.length === 0}>
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>
          )}
        </div>

        {isLoadingTransactions ? (
          <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th/><th/><th/><th/><th/><th/></tr></thead><tbody className="bg-white divide-y divide-gray-200">{Array.from({ length: 5 }).map((_, i) => (<SkeletonRow key={i} />))}</tbody></table></div>
        ) : transactions.length > 0 ? (
          <TransactionTable transactions={transactions} onRowClick={handleTransactionClick} />
        ) : (
          <div className="text-center py-16"><CreditCard className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium text-gray-900">No transactions found for this account</h3><p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p><div className="mt-6"><button onClick={clearFilters} className="text-sm font-medium text-primary hover:text-primary-hover">Clear all filters</button></div></div>
        )}
        {!isLoadingTransactions && transactionPagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200"><Pagination currentPage={transactionPagination.page} totalPages={transactionPagination.totalPages} onPageChange={handlePageChange} /></div>
        )}
      </div>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Account" description="Are you sure you want to delete this account? This action cannot be undone and will delete all associated transactions." isConfirming={deleteAccountMutation.isLoading} />
      <AddAccountForm isOpen={isEditFormOpen} onClose={() => setIsEditFormOpen(false)} editingAccount={account} onSuccess={handleFormSuccess} />
      <TransactionDetailsModal isOpen={isTransactionModalOpen} onClose={() => setSelectedTransactionId(null)} transactionId={selectedTransactionId} />
    </div>
  );
};

export default AccountDetails;

