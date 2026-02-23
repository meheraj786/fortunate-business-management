import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CreditCard,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown,
} from "lucide-react";
import { useTransactions } from "@/api/hooks/transaction"; // Updated import
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import Button from "@/components/ui/Button"; // Import Button
import { motion } from "framer-motion"; // Import motion
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

const TransactionList = () => {
  // State for UI controls
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    transactionType: "all",
    paymentMethod: "all",
    category: "all",
  });
  const [sorting, setSorting] = useState({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State for Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Constructing params for the react-query hook
  const queryParams = useMemo(() => {
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

  // Using the react-query hook for data fetching
  const { data: response, isLoading, isError } = useTransactions(queryParams);

  // Derived state from the hook's response
  const transactions = response?.data?.transactions?.docs || [];
  const pagination = response?.data?.transactions || {};
  const categories = response?.data?.categories || [];

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset page on filter change
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

  const clearFilters = () => {
    setFilters({
      transactionType: "all",
      paymentMethod: "all",
      category: "all",
    });
    setSearchTerm("");
    setSorting({ sortBy: "date", sortOrder: "desc" });
    setShowFilters(false);
    setPage(1);
  };

  const handleTransactionClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleSort = (newSortBy) => {
    setSorting((prev) => ({
      sortBy: newSortBy,
      sortOrder:
        prev.sortBy === newSortBy
          ? prev.sortOrder === "asc"
            ? "desc"
            : "asc"
          : "desc",
    }));
    setPage(1);
  };

  return (
    <motion.div>
      <div className="bg-white rounded-lg shadow-sm mt-6">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[var(--color-primary)]" />
            All Transactions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Browse and manage all recorded financial movements.
          </p>
        </div>

        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
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
            <div className="relative w-full md:w-48">
              <SelectField
                value={sorting.sortBy}
                onChange={(val) => handleSortByChange({ target: { value: val } })}
                options={sortOptions}
                className="mb-0"
              />
            </div>
            <Button
              onClick={toggleSortOrder}
              variant="secondary"
              size="sm"
              className="flex items-center justify-center gap-2"
            >
              {sorting.sortOrder === "asc" ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
              className="flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filter Options</h3>
                <Button
                  onClick={clearFilters}
                  variant="subtle"
                  className="text-sm text-[var(--color-danger)] flex items-center gap-1"
                >
                  <X size={16} /> Clear
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <SelectField
                  value={filters.transactionType}
                  onChange={(val) =>
                    handleFilterChange("transactionType", val)
                  }
                  options={transactionTypeOptions}
                  className="mb-0"
                />
                <SelectField
                  value={filters.paymentMethod}
                  onChange={(val) =>
                    handleFilterChange("paymentMethod", val)
                  }
                  options={paymentMethodOptions}
                  className="mb-0"
                />
                <SelectField
                  value={filters.category}
                  onChange={(val) =>
                    handleFilterChange("category", val)
                  }
                  options={[
                    { value: "all", label: "All Categories" },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                  disabled={categories.length === 0}
                  className="mb-0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                {/* Header for skeleton, matches TransactionTable */}
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description / Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          ) : isError ? (
            <div className="text-center py-16 text-[var(--color-danger)]">
              Failed to load transactions.
            </div>
          ) : transactions.length > 0 ? (
            <TransactionTable
              transactions={transactions}
              onRowClick={handleTransactionClick}
              sortBy={sorting.sortBy}
              sortOrder={sorting.sortOrder}
              onSort={handleSort}
            />
          ) : (
            <div className="text-center py-16">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No transactions found
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
        </div>

        {!isLoading && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        transactionId={selectedTransactionId}
      />
    </motion.div>
  );
};

export default TransactionList;
