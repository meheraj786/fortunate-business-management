import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  CreditCard,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import TransactionTable from "./components/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

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

const TransactionList = ({ refresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
  });
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  const fetchTransactions = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: pagination.limit,
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
        });

        if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
        if (filters.transactionType !== "all")
          params.append("transactionType", filters.transactionType);
        if (filters.paymentMethod !== "all")
          params.append("paymentMethod", filters.paymentMethod);
        if (filters.category !== "all")
          params.append("category", filters.category);

        const response = await api.get(
          `/transactions/get-all-transactions?${params.toString()}`
        );

        if (response.data.success) {
          const { transactions: transData, categories: catData } =
            response.data.data;
          setTransactions(transData.docs);
          setPagination({
            page: transData.page,
            limit: transData.limit,
            totalPages: transData.totalPages,
            totalDocs: transData.totalDocs,
          });
          setCategories(catData || []);
        } else {
          toast.error(
            response.data.message || "Failed to fetch transactions."
          );
        }
      } catch (error) {
        toast.error(
          "An unexpected error occurred while fetching transactions."
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, sorting, filters, debouncedSearchTerm]
  );

  useEffect(() => {
    fetchTransactions(pagination.page);
  }, [fetchTransactions, refresh]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((p) => ({ ...p, page: newPage }));
      fetchTransactions(newPage);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((p) => ({ ...p, page: 1 })); // Reset page
  };

  const handleSortByChange = (e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const toggleSortOrder = () => {
    setSorting((prev) => ({ 
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setPagination((p) => ({ ...p, page: 1 }));
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
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 sm:p-6 border-b">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-gray-700" />
          All Transactions
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Browse and manage all recorded financial movements.
        </p>
      </div>

      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative w-full md:w-48">
            <select
              value={sorting.sortBy}
              onChange={handleSortByChange}
              className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort by {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
          <button
            onClick={toggleSortOrder}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            {sorting.sortOrder === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filter Options</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X size={16} /> Clear
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                name="transactionType"
                value={filters.transactionType}
                onChange={(e) =>
                  handleFilterChange("transactionType", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                {transactionTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={(e) =>
                  handleFilterChange("paymentMethod", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                {paymentMethodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                name="category"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                disabled={categories.length === 0}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <table className="w-full">
            <thead className="bg-gray-50">
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
        ) : transactions.length > 0 ? (
          <TransactionTable transactions={transactions} />
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
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionList;
