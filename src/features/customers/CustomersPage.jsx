import React, { useState, useCallback, useEffect } from "react";
import CustomerCard from "./components/CustomerCard";
import {
  Filter,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown,
  Users,
  Trash,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCustomerSummary } from "../../api/hooks/customer";
import { useAuth } from "../../context/AuthContext";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { showErrorToast } from "@/utils/notifications";
import { useDebounce } from "@/hooks/useDebounce";

const sortOptions = [
  { value: "joinDate", label: "Join Date" },
  { value: "totalSpent", label: "Total Spent" },
  { value: "totalPurchases", label: "Total Purchases" },
  { value: "lastPurchaseDate", label: "Last Purchase" },
  { value: "creditLimit", label: "Credit Limit" },
  { value: "totalDue", label: "Total Due" },
  { value: "name", label: "Name" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Suspended", label: "Suspended" },
];

const customerTypeOptions = [
  { value: "", label: "All Types" },
  { value: "Retail", label: "Retail" },
  { value: "Wholesale", label: "Wholesale" },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="border-t border-gray-200 pt-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

const Customers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ status: "", customerType: "" });
  const [sorting, setSorting] = useState({
    sortBy: "joinDate",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission("CUSTOMER_VIEW_TABLE")) {
      showErrorToast("You don't have permission to view customers.");
      navigate("/");
    }
  }, [hasPermission, navigate]);

  const queryParams = {
    page,
    limit: 12,
    search: debouncedSearchTerm,
    status: filters.status || undefined,
    customerType: filters.customerType || undefined,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  };

  const {
    data: apiResponse,
    isLoading: loading,
    isError,
    error,
  } = useCustomerSummary(queryParams);

  const customers =
    apiResponse?.data?.customers || apiResponse?.customers || [];
  const totalPages =
    apiResponse?.data?.totalPages || apiResponse?.totalPages || 1;

  useEffect(() => {
    if (isError) {
      showErrorToast(error, "Could not load customers. Please try again.");
    }
  }, [isError, error]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
    setPage(1);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSorting((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ status: "", customerType: "" });
    setSearchTerm("");
    setSorting({ sortBy: "joinDate", sortOrder: "desc" });
    setShowFilters(false);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages],
  );

  return (
    <motion.div
      className="space-y-6" // Added padding for overall layout
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Customers
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage your customer relationships and track their purchases
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission("TRASH_VIEW_CUSTOMER") && (
            <Link to="/trash/customer">
              <Button
                variant="danger"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Trash Customer"
              >
                <Trash className="w-5 h-5" /> Trash Customer
              </Button>
            </Link>
          )}

          {hasPermission("CUSTOMER_CREATE") && (
            <Link to="/customer-form" className="flex-shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
                aria-label="Add Customer"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <label htmlFor="customer-search" className="sr-only">
              Search by name, phone, or ID
            </label>
            <input
              id="customer-search"
              type="text"
              placeholder="Search by name, phone, or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-48">
            <select
              value={sorting.sortBy}
              onChange={handleSortByChange}
              className="w-full appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <Button
            onClick={toggleSortOrder}
            variant="secondary"
            size="sm"
            className="flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {sorting.sortOrder === "asc" ? (
              <>
                <ArrowUp className="w-4 h-4" />
                <span className="hidden sm:inline">Ascending</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4" />
                <span className="hidden sm:inline">Descending</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
            size="sm"
            className="flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(filters.status || filters.customerType) && (
              <span className="w-2 h-2 bg-[var(--color-danger)] rounded-full"></span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Filter Customers
              </h3>
              <Button
                onClick={clearFilters}
                variant="subtle"
                className="flex items-center gap-2 text-sm text-[var(--color-danger)] hover:text-[var(--color-danger-dark)]"
              >
                <X className="w-4 h-4" /> Clear All Filters
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Type
                </label>
                <select
                  value={filters.customerType}
                  onChange={(e) =>
                    handleFilterChange("customerType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                >
                  {customerTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : customers.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {customers.map((customer) => (
              <motion.div key={customer._id}>
                <CustomerCard customer={customer} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Customers Found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filters.status || filters.customerType
                ? "Try adjusting your search or filters."
                : "Get started by adding your first customer."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={clearFilters}
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
              {hasPermission("CUSTOMER_CREATE") && (
                <Link to="/customer-form">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Add Customer
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
      </div>
    </motion.div>
  );
};

export default Customers;
