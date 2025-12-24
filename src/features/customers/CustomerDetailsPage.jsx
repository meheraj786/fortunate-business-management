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
} from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useCustomerSummary } from "@/api/hooks/customer";

/* -------------------- CONSTANTS -------------------- */

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

/* -------------------- PAGINATION -------------------- */

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Page <span className="font-semibold">{currentPage}</span> of{" "}
        <span className="font-semibold">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/* -------------------- SKELETON -------------------- */

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
    <div className="h-24 bg-gray-200 rounded"></div>
  </div>
);

/* ==================== MAIN COMPONENT ==================== */

const Customers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    status: "",
    customerType: "",
  });

  const [sorting, setSorting] = useState({
    sortBy: "joinDate",
    sortOrder: "desc",
  });

  /* -------------------- QUERY PARAMS -------------------- */

  const params = {
    page,
    limit: 12,
    search: debouncedSearchTerm || undefined,
    status: filters.status || undefined,
    customerType: filters.customerType || undefined,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  };

  const { data, isLoading, isError } = useCustomerSummary(params);

  const customers = data?.data?.customers || [];
  const totalPages = data?.data?.totalPages || 1;

  /* -------------------- ERROR HANDLING -------------------- */

  useEffect(() => {
    if (isError) {
      toast.error("Could not load customers. Please try again.");
    }
  }, [isError]);

  /* -------------------- HANDLERS -------------------- */

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
    setSorting({ sortBy: "joinDate", sortOrder: "desc" });
    setSearchTerm("");
    setPage(1);
    setShowFilters(false);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  /* -------------------- RENDER -------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600">
            Manage your customer relationships
          </p>
        </div>
        <Link to="/customer-form">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
            <Plus size={18} /> Add Customer
          </button>
        </Link>
      </div>

      {/* Search & Controls */}
      <div className="bg-white p-4 rounded-xl border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={sorting.sortBy}
            onChange={handleSortByChange}
            className="border rounded-lg px-3 py-2"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={toggleSortOrder}
            className="border rounded-lg px-4 py-2"
          >
            {sorting.sortOrder === "asc" ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border rounded-lg px-4 py-2 flex gap-2 items-center"
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-2 gap-4">
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange("status", e.target.value)
              }
              className="border rounded-lg px-3 py-2"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={filters.customerType}
              onChange={(e) =>
                handleFilterChange("customerType", e.target.value)
              }
              className="border rounded-lg px-3 py-2"
            >
              {customerTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="text-red-600 text-sm flex items-center gap-2"
            >
              <X size={14} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : customers.length ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {customers.map((c) => (
              <CustomerCard key={c._id} customer={c} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white border rounded-xl">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold">No Customers Found</h3>
          <p className="text-gray-500">Try adjusting filters</p>
        </div>
      )}
    </div>
  );
};

export default Customers;
