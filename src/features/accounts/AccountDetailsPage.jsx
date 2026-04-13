import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Building,
  Smartphone,
  CreditCard,
  Hash,
  User,
  Calendar,
  Info,
  Edit,
  Trash2,
  Wallet,
  Search,
  ArrowUp,
  ArrowDown,
  X,
  MapPin,
  Filter,
  Phone
} from "lucide-react";
import { useAccountDetails, useDeleteAccount } from "@/api/hooks/account";
import { useAccountTransactions } from "@/api/hooks/transaction";
import { showErrorToast } from "@/utils/notifications";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddAccountForm from "./AddAccountForm";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { useSettings } from "@/context/SettingsContext";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import SelectField from "@/components/ui/SelectField";
import EntityAuditLog from "@/components/ui/EntityAuditLog";

const sortOptions = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "category", label: "Category" },
];

const transactionTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Income", label: "Income" },
  { value: "Expense", label: "Expense" },
];


const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-24"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
  </tr>
);

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { formatCurrency, formatDateTime } = useSettings();

  // UI Control State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // Controls the secondary filter row

  // Filter and Sort states
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    transactionType: "all",
    category: "all",
  });
  const [sorting, setSorting] = useState({ sortBy: "date", sortOrder: "desc" });

  useEffect(() => {
    if (!hasPermission("ACCOUNT_VIEW_DETAILS")) {
      showErrorToast("You don't have permission to view account details.");
      navigate("/accounts");
    }
  }, [hasPermission, navigate]);

  // Data Fetching
  const {
    data: detailsResponse,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
  } = useAccountDetails(accountId);
  const account = detailsResponse?.data?.account;
  const accountStats = detailsResponse?.data?.stats;

  const transactionParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (filters.transactionType !== "all") params.transactionType = filters.transactionType;
    if (filters.category !== "all") params.category = filters.category;
    return params;
  }, [page, sorting, filters, debouncedSearchTerm]);

  const { data: transResponse, isLoading: isLoadingTransactions } =
    useAccountTransactions(accountId, transactionParams);
  
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

  const clearFilters = () => {
    setFilters({
      transactionType: "all",
      category: "all",
    });
    setSearchTerm("");
    setSorting({ sortBy: "date", sortOrder: "desc" });
    setPage(1);
    setShowFilters(false);
  };

  const isFiltered =
    filters.transactionType !== "all" ||
    filters.category !== "all" ||
    searchTerm !== "" ||
    sorting.sortBy !== "date" ||
    sorting.sortOrder !== "desc";

  const confirmDelete = () => {
    deleteAccountMutation.mutate(accountId, {
      onSuccess: () => navigate("/accounts"),
    });
  };

  const handleTransactionClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsTransactionModalOpen(true);
  };

  if ((isDetailsError || !account) && !isLoadingDetails) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border border-gray-200 shadow-sm mt-6">
        <h2 className="text-xl font-semibold mb-2">Account not found.</h2>
        <Link
          to="/accounts"
          className="text-[var(--color-primary)] hover:underline"
        >
          Go back to Accounts
        </Link>
      </div>
    );
  }

  const isBank = account?.accountType === "Bank";
  const isMobile = account?.accountType === "Mobile Banking";

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Top bar with back button and actions */}
        <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50">
          <Link
            to="/accounts"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Accounts</span>
          </Link>
          <div className="flex items-center gap-2">
            {hasPermission("ACCOUNT_UPDATE") && (
              <Button onClick={() => setIsEditFormOpen(true)} variant="subtle" size="sm" className="bg-white border border-gray-200 hover:bg-gray-50">
                 <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            )}
            {hasPermission("ACCOUNT_DELETE") && (
              <Button onClick={() => setIsDeleteModalOpen(true)} variant="subtle" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-white border border-red-100">
                 <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:justify-between md:items-center">
          {/* Left: Account Identity */}
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
               {isBank ? <Building className="w-6 h-6 text-gray-500" /> : isMobile ? <Smartphone className="w-6 h-6 text-gray-500" /> : <Wallet className="w-6 h-6 text-gray-500" />}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-900 mb-1">
                 {isLoadingDetails ? <ValueSkeleton width="w-48" height="h-8" /> : account.accountName}
               </h1>
               <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {isLoadingDetails ? <ValueSkeleton width="w-32" /> : account.accountHolderName || "N/A"}
                  </span>
                  {(isBank || isMobile) && <span className="text-gray-300">•</span>}
                  {isBank && (
                     <span className="flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-gray-400" />
                        {isLoadingDetails ? <ValueSkeleton width="w-24" /> : account.accountNumber}
                     </span>
                  )}
                  {isMobile && (
                     <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {isLoadingDetails ? <ValueSkeleton width="w-28" /> : account.mobileNumber}
                     </span>
                  )}
               </div>
             </div>
          </div>

          {/* Right: Massive Balance */}
          <div className="md:text-right bg-gray-50 md:bg-transparent rounded-lg p-4 md:p-0 border border-gray-100 md:border-none inline-block">
             <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Current Balance</p>
             <div className="text-3xl lg:text-4xl font-bold text-[var(--color-success)] tracking-tight">
               {isLoadingDetails ? <ValueSkeleton width="w-32" height="h-10" /> : formatCurrency(accountStats?.currentBalance || 0)}
             </div>
          </div>
        </div>
      </div>

      {/* 2. Compact Info & Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Details Panel */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
               <Info className="w-4 h-4 text-[var(--color-primary)]" /> Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
               <div className="flex flex-col">
                 <span className="text-gray-500 mb-0.5">Institution Type</span>
                 <span className="font-medium text-gray-900">{isLoadingDetails ? <ValueSkeleton width="w-20" /> : account.accountType}</span>
               </div>
               
               {isBank && (
                 <>
                   <div className="flex flex-col">
                     <span className="text-gray-500 mb-0.5">Bank Name</span>
                     <span className="font-medium text-gray-900 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-gray-400"/> {account.bankName}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-gray-500 mb-0.5">Branch Name</span>
                     <span className="font-medium text-gray-900 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400"/> {account.branchName || "N/A"}</span>
                   </div>
                 </>
               )}
               {isMobile && (
                 <div className="flex flex-col">
                   <span className="text-gray-500 mb-0.5">Service Name</span>
                   <span className="font-medium text-gray-900 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-gray-400"/> {account.serviceName}</span>
                 </div>
               )}
               {account?.routingNumber && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-0.5">Routing Number</span>
                    <span className="font-medium text-gray-900">{account.routingNumber}</span>
                  </div>
               )}
               {account?.swiftCode && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-0.5">SWIFT Code</span>
                    <span className="font-medium text-gray-900">{account.swiftCode}</span>
                  </div>
               )}
               <div className="flex flex-col">
                 <span className="text-gray-500 mb-0.5">Added On</span>
                 <span className="font-medium text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400"/> {isLoadingDetails ? <ValueSkeleton width="w-24" /> : formatDateTime(account?.createdAt)}</span>
               </div>
            </div>
         </div>

         {/* Compact Stats */}
         <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
                 <p className="text-lg font-bold text-gray-900">
                   {isLoadingDetails ? <ValueSkeleton width="w-24" /> : formatCurrency(accountStats?.totalIncome || 0)}
                 </p>
               </div>
               <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <ArrowUp className="w-5 h-5 text-green-600" />
               </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Total Expense</p>
                 <p className="text-lg font-bold text-gray-900">
                   {isLoadingDetails ? <ValueSkeleton width="w-24" /> : formatCurrency(accountStats?.totalExpense || 0)}
                 </p>
               </div>
               <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <ArrowDown className="w-5 h-5 text-red-600" />
               </div>
            </div>
         </div>
      </div>

      {/* 3. Streamlined Transactions Area */}
      {hasPermission("ACCOUNT_VIEW_TRANSACTIONS") && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-[var(--color-primary)]" /> Transactions History
               </h2>
            </div>
            
            {/* Essential Toolbar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
                  />
               </div>
               <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${showFilters || isFiltered ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
               >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {isFiltered && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] ml-1"></span>}
               </button>
            </div>
          </div>

          {/* Expandable Advanced Filters */}
          {showFilters && (
             <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3
             ">
                <SelectField
                  value={filters.transactionType}
                  onChange={(val) => handleFilterChange("transactionType", val)}
                  options={transactionTypeOptions}
                  className="mb-0 text-sm"
                  label="Type"
                />
                <SelectField
                  value={filters.category}
                  onChange={(val) => handleFilterChange("category", val)}
                  options={[
                    { value: "all", label: "All Categories" },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  disabled={categories.length === 0}
                  className="mb-0 text-sm"
                  label="Category"
                />
                <div className="flex gap-2 items-end">
                   <SelectField
                     value={sorting.sortBy}
                     onChange={(val) => handleSortByChange({ target: { value: val } })}
                     options={sortOptions}
                     className="mb-0 text-sm flex-1"
                     label="Sort By"
                   />
                   <Button
                     onClick={() => setSorting(p => ({...p, sortOrder: p.sortOrder === "asc" ? "desc" : "asc"}))}
                     variant="outline"
                     className="px-3"
                     title="Toggle sort direction"
                   >
                     {sorting.sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                   </Button>
                </div>
             </div>
          )}
          {isFiltered && !showFilters && (
             <div className="px-5 py-2 bg-indigo-50/50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs text-indigo-800 font-medium tracking-wide">Filters applied</span>
                <button onClick={clearFilters} className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 border border-indigo-200 px-2 py-1 rounded bg-white">Clear All</button>
             </div>
          )}

          {/* Table */}
          {isLoadingTransactions ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr><th className="p-4" /><th /><th /><th /></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : transactions.length > 0 ? (
            <TransactionTable
              transactions={transactions}
              onRowClick={handleTransactionClick}
              hideAccountColumn={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                 <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800">No transactions found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                Try adjusting your search or filter criteria.
              </p>
              {isFiltered && (
                <button onClick={clearFilters} className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline">
                   Clear all filters
                </button>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoadingTransactions && transactionPagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100">
               <Pagination
                 currentPage={transactionPagination.page}
                 totalPages={transactionPagination.totalPages}
                 onPageChange={handlePageChange}
               />
            </div>
          )}
        </div>
      )}

      {/* Audit Log */}
      {hasPermission("AUDIT_VIEW") && (
        <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
          <EntityAuditLog moduleId={accountId} moduleName="Account" />
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone and will delete all associated transactions."
        isConfirming={deleteAccountMutation.isLoading}
      />
      <AddAccountForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        editingAccount={account}
        onSuccess={() => setIsEditFormOpen(false)}
      />
      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
           setIsTransactionModalOpen(false);
           setSelectedTransactionId(null);
        }}
        transactionId={selectedTransactionId}
      />
    </div>
  );
};

export default AccountDetails;
