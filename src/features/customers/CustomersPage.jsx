import React, { useState, useEffect, useRef } from "react";
import CustomerCard from "./components/CustomerCard";
import {
  Filter,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

const sortOptions = [
  { value: "joinDate", label: "Join Date" },
  { value: "totalSpent", label: "Total Spent" },
  { value: "totalPurchases", label: "Total Purchases" },
  { value: "lastPurchaseDate", label: "Last Purchase" },
  { value: "creditLimit", label: "Credit Limit" },
  { value: "totalDue", label: "Total Due" },
];

const statusOptions = ["Active", "Suspended"];
const customerTypeOptions = ["Retail", "Wholesale"];

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-4 py-2 mx-1 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-100 transition-colors"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600 mx-4">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-4 py-2 mx-1 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-100 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm animate-pulse">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
    <div className="h-3 bg-gray-200 rounded w-5/6 mt-2"></div>
  </div>
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    status: "",
    customerType: "",
  });
  const [sorting, setSorting] = useState({
    sortBy: "joinDate",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearchTerm, filters, sorting]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          search: debouncedSearchTerm,
          status: filters.status,
          customerType: filters.customerType,
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
        };

        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null) {
            delete params[key];
          }
        });

        const res = await api.get(`/customer/summary`, { params });

        if (res.data && res.data.data) {
          const { customers, totalPages, currentPage } = res.data.data;
          setCustomers(customers);
          setTotalPages(totalPages);
          setPage(currentPage);
        } else {
          setCustomers([]);
          setTotalPages(1);
          setPage(1);
        }
      } catch (err) {
        console.error("Failed to fetch customer summary:", err);
        toast.error("Could not load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, debouncedSearchTerm, filters, sorting]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortByChange = (e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
  };

  const toggleSortOrder = () => {
    setSorting((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setFilters({ status: "", customerType: "" });
    setSearchTerm("");
    setSorting({ sortBy: "joinDate", sortOrder: "desc" });
    setShowFilters(false);
  };

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold">Your Customers</h2>
        <Link to="/customer-form">
          <button className="flex items-center gap-x-2 rounded-lg bg-primary px-4 py-3 text-white transition-colors duration-300 hover:bg-primary-hover">
            <Plus size={22} /> Add Customer
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div className="relative md:col-span-2">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-primary sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            value={sorting.sortBy}
            onChange={handleSortByChange}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort by: {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSortOrder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            {sorting.sortOrder === "asc" ? (
              <ArrowUp size={20} />
            ) : (
              <ArrowDown size={20} />
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 bg-gray-50 p-4 rounded-lg border overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border-gray-300 text-sm"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                value={filters.customerType}
                onChange={(e) =>
                  handleFilterChange("customerType", e.target.value)
                }
                className="w-full rounded-lg border-gray-300 text-sm"
              >
                <option value="">All Types</option>
                {customerTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : customers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {customers.map((customer) => (
              <CustomerCard key={customer._id} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">
              No Customers Found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {!loading && customers.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default Customers;
