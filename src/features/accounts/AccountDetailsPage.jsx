import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Building,
  Smartphone,
  CreditCard,
  DollarSign,
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
} from "lucide-react";
import { useAccountDetails, useDeleteAccount } from "@/api/hooks/account";
import { useAccountTransactions } from "@/api/hooks/transaction";
import { showErrorToast } from "@/utils/notifications";

import StatBox from "@/components/ui/StatBox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddAccountForm from "./AddAccountForm";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { useSettings } from "@/context/SettingsContext";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import AuditInfoSection from "@/components/ui/AuditInfoSection";
import SelectField from "@/components/ui/SelectField";

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
const paymentMethodOptions = [
  { value: "all", label: "All Methods" },
  { value: "Bank", label: "Bank" },
  { value: "Mobile Banking", label: "Mobile Banking" },
  { value: "Cash", label: "Cash" },
];

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-200 rounded w-24 ml-auto"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-full w-32"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-40"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
  </tr>
);

const StatBoxSkeleton = () => (
  <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
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

  // Filter and Sort states
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    transactionType: "all",
    paymentMethod: "all",
    category: "all",
  });
  const [sorting, setSorting] = useState({ sortBy: "date", sortOrder: "desc" });

  useEffect(() => {
    if (!hasPermission("ACCOUNT_VIEW_DETAILS")) {
      showErrorToast("You don't have permission to view account details.");
      navigate("/accounts");
    }
  }, [hasPermission, navigate]);

  // Data Fetching via React Query
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
    if (filters.transactionType !== "all")
      params.transactionType = filters.transactionType;
    if (filters.paymentMethod !== "all")
      params.paymentMethod = filters.paymentMethod;
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

  const handleSortByChange = (e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSorting((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const isFiltered =
    filters.transactionType !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.category !== "all" ||
    searchTerm !== "";

  const clearFilters = () => {
    setFilters({
      transactionType: "all",
      paymentMethod: "all",
      category: "all",
    });
    setSearchTerm("");
    setSorting({ sortBy: "date", sortOrder: "desc" });
    setPage(1);
  };

  const confirmDelete = () => {
    deleteAccountMutation.mutate(accountId, {
      onSuccess: () => {
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

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedTransactionId(null);
  };

  const renderStats = () => {
    if (isLoadingDetails) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatBox key={i} loading={true} />
          ))}
        </div>
      );
    }
    if (accountStats) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatBox
            title="Current Balance"
            number={formatCurrency(accountStats.currentBalance)}
            Icon={Wallet}
            textColor="blue"
          />
          <StatBox
            title="Total Income"
            number={formatCurrency(accountStats.totalIncome)}
            Icon={ArrowUp}
            textColor="green"
          />
          <StatBox
            title="Total Expense"
            number={formatCurrency(accountStats.totalExpense)}
            Icon={ArrowDown}
            textColor="red"
          />
          <StatBox
            title="Largest Income"
            number={formatCurrency(accountStats.largestIncome)}
            Icon={ArrowUp}
            textColor="green"
          />
          <StatBox
            title="Largest Expense"
            number={formatCurrency(accountStats.largestExpense)}
            Icon={ArrowDown}
            textColor="red"
          />
          <StatBox
            title="Avg. Transaction"
            number={formatCurrency(accountStats.averageTransactionAmount || 0)}
            Icon={DollarSign}
            textColor="default"
          />
        </div>
      );
    }
    return null;
  };

  if ((isDetailsError || !account) && !isLoadingDetails) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Account not found.</h2>
        <Link
          to="/accounts"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
        >
          Go back to Accounts
        </Link>
      </div>
    );
  }

  const isBank = account?.accountType === "Bank";
  const isMobile = account?.accountType === "Mobile Banking";

  return (
    <motion.div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Left side */}
        <div className="flex items-start sm:items-center gap-3">
          <Link
            to="/accounts"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back to accounts"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </Link>

          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 leading-tight">
              {isLoadingDetails ? (
                <ValueSkeleton width="w-48" height="h-8" />
              ) : (
                account.accountName
              )}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isLoadingDetails ? (
                <ValueSkeleton width="w-32" height="h-4" />
              ) : (
                account.accountHolderName
              )}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          {hasPermission("ACCOUNT_UPDATE") && (
            <Button
              onClick={() => setIsEditFormOpen(true)}
              variant="primary"
              size="sm"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Edit size={16} /> Edit
            </Button>
          )}
          {hasPermission("ACCOUNT_DELETE") && (
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              variant="danger"
              size="sm"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Trash2 size={16} /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-[var(--color-primary)]" /> Account
          Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base sm:text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <strong>Balance:</strong>{" "}
            {isLoadingDetails ? (
              <ValueSkeleton width="w-20" />
            ) : (
              formatCurrency(account.balance)
            )}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <strong>Holder:</strong>{" "}
            {isLoadingDetails ? (
              <ValueSkeleton width="w-32" />
            ) : (
              account?.accountHolderName
            )}
          </div>
          <div className="flex items-center gap-2">
            {isBank ? (
              <Building className="w-4 h-4 text-gray-500" />
            ) : isMobile ? (
              <Smartphone className="w-4 h-4 text-gray-500" />
            ) : (
              <Wallet className="w-4 h-4 text-gray-500" />
            )}
            <strong>
              {isBank ? "Bank:" : isMobile ? "Service:" : "Account:"}
            </strong>{" "}
            {isLoadingDetails ? (
              <ValueSkeleton width="w-24" />
            ) : isBank ? (
              account?.bankName
            ) : isMobile ? (
              account?.serviceName
            ) : (
              account?.accountName
            )}
          </div>
          {isBank && (
            <>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <strong>A/C Number:</strong>{" "}
                {isLoadingDetails ? (
                  <ValueSkeleton width="w-32" />
                ) : (
                  account?.accountNumber
                )}
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                <strong>Branch:</strong>{" "}
                {isLoadingDetails ? (
                  <ValueSkeleton width="w-24" />
                ) : (
                  account?.branchName
                )}
              </div>
            </>
          )}
          {isMobile && (
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <strong>Mobile No:</strong>{" "}
              {isLoadingDetails ? (
                <ValueSkeleton width="w-28" />
              ) : (
                account?.mobileNumber
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <strong>Created At:</strong>{" "}
            {isLoadingDetails ? (
              <ValueSkeleton width="w-32" />
            ) : (
              formatDateTime(account?.createdAt)
            )}
          </div>
        </div>
      </div>

      {renderStats()}

      {/* Transactions List */}
      {hasPermission("ACCOUNT_VIEW_TRANSACTIONS") && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />{" "}
              Transactions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View financial movements associated with this account.
            </p>
          </div>
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <label htmlFor="transaction-search" className="sr-only">
                  Search by description
                </label>
                <input
                  id="transaction-search"
                  type="text"
                  placeholder="Search by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm transition-shadow"
                />
              </div>
              <div className="w-full sm:w-auto">
                <SelectField
                  value={filters.transactionType}
                  onChange={(val) => handleFilterChange("transactionType", val)}
                  options={transactionTypeOptions}
                  className="mb-0"
                />
              </div>
              <div className="w-full sm:w-auto">
                <SelectField
                  value={filters.paymentMethod}
                  onChange={(val) => handleFilterChange("paymentMethod", val)}
                  options={paymentMethodOptions}
                  className="mb-0"
                />
              </div>
              <div className="w-full sm:w-auto">
                <SelectField
                  value={filters.category}
                  onChange={(val) => handleFilterChange("category", val)}
                  options={[
                    { value: "all", label: "All Categories" },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  disabled={categories.length === 0}
                  className="mb-0"
                />
              </div>
              <div className="w-full sm:w-auto">
                <SelectField
                  value={sorting.sortBy}
                  onChange={(val) => handleSortByChange({ target: { value: val } })}
                  options={sortOptions.map(opt => ({ ...opt, label: `Sort by ${opt.label}` }))}
                  className="mb-0"
                />
              </div>
              <Button
                onClick={toggleSortOrder}
                variant="secondary"
                size="sm"
                className="flex items-center justify-center"
                aria-label={sorting.sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              >
                {sorting.sortOrder === "asc" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </Button>
              {isFiltered && (
                <Button
                  onClick={clearFilters}
                  variant="subtle"
                  size="sm"
                  className="text-sm text-[var(--color-danger)] flex items-center gap-1"
                >
                  <X size={16} /> Clear
                </Button>
              )}
            </div>
          </div>

          {isLoadingTransactions ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th />
                    <th />
                    <th />
                    <th />
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : transactions.length > 0 ? (
            <TransactionTable
              transactions={transactions}
              onRowClick={handleTransactionClick}
            />
          ) : (
            <div className="text-center py-16">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No transactions found for this account
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
              <div className="mt-6">
                <Button
                  onClick={clearFilters}
                  variant="subtle"
                  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
          {!isLoadingTransactions && transactionPagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={transactionPagination.page}
                totalPages={transactionPagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <AuditInfoSection
        createdBy={account?.createdBy}
        createdAt={account?.createdAt}
        modifiedBy={account?.modifiedBy}
        updatedAt={account?.updatedAt}
        deletedBy={account?.deletedBy}
        deletedAt={account?.deletedAt}
        isDeleted={account?.isDeleted}
      />

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
        onSuccess={handleFormSuccess}
      />
      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        transactionId={selectedTransactionId}
      />
    </motion.div>
  );
};

export default AccountDetails;
