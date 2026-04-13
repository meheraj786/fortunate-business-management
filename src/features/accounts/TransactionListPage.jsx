import React, { useState, useMemo } from "react";
import {
  Search,
  CreditCard,
  ArrowUp,
  ArrowDown,
  X,
  Filter
} from "lucide-react";
import { useTransactions } from "@/api/hooks/transaction"; 
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import Button from "@/components/ui/Button"; 
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
      <div className="h-5 bg-gray-200 rounded w-24"></div>
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

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (filters.transactionType !== "all") params.transactionType = filters.transactionType;
    if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
    if (filters.category !== "all") params.category = filters.category;
    return params;
  }, [page, sorting, filters, debouncedSearchTerm]);

  const { data: response, isLoading, isError } = useTransactions(queryParams);

  const transactions = response?.data?.transactions?.docs || [];
  const pagination = response?.data?.transactions || {};
  const categories = response?.data?.categories || [];

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
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
      paymentMethod: "all",
      category: "all",
    });
    setSearchTerm("");
    setSorting({ sortBy: "date", sortOrder: "desc" });
    setPage(1);
    setShowFilters(false);
  };

  const isFiltered =
    filters.transactionType !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.category !== "all" ||
    searchTerm !== "" ||
    sorting.sortBy !== "date" ||
    sorting.sortOrder !== "desc";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
      
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div>
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <CreditCard className="w-5 h-5 text-[var(--color-primary)]" /> All Transactions
           </h2>
           <p className="text-sm text-gray-500 mt-1">
             Browse and manage all recorded financial movements.
           </p>
        </div>
        
        {/* Essential Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
           <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm shadow-sm"
              />
           </div>
           <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors shadow-sm ${showFilters || isFiltered ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
           >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {isFiltered && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] ml-1"></span>}
           </button>
        </div>
      </div>

      {/* Expandable Advanced Filters */}
      {showFilters && (
         <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <SelectField
              value={filters.transactionType}
              onChange={(val) => handleFilterChange("transactionType", val)}
              options={transactionTypeOptions}
              className="mb-0 text-sm"
              label="Type"
            />
            <SelectField
              value={filters.paymentMethod}
              onChange={(val) => handleFilterChange("paymentMethod", val)}
              options={paymentMethodOptions}
              className="mb-0 text-sm"
              label="Method"
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
                 options={sortOptions} // Note: original code used a custom map locally, but sortOptions has raw labels
                 className="mb-0 text-sm flex-1"
                 label="Sort By"
               />
               <Button
                 onClick={() => {
                    setSorting(p => ({...p, sortOrder: p.sortOrder === "asc" ? "desc" : "asc"}));
                    setPage(1);
                 }}
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
      <div className="overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Description / Source</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-600">
             <X className="w-10 h-10 mb-2 opacity-50" />
            <span className="font-semibold">Failed to load transactions.</span>
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
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No transactions found
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            {isFiltered && (
              <div className="mt-6">
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isLoading && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        transactionId={selectedTransactionId}
      />
    </div>
  );
};

export default TransactionList;
