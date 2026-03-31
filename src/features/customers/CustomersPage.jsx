import React, { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Trash,
  Users,
  UserCheck,
  UserX,
  Store,
  ShoppingCart,
  DollarSign,
  Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCustomerSummary, useCustomerStats } from "@/api/hooks/customer";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import Button from "@/components/ui/Button";
import StatBox from "@/components/ui/StatBox";
import { motion } from "framer-motion";
import { showErrorToast } from "@/utils/notifications";
import { useDebounce } from "@/hooks/useDebounce";
import CustomerTable from "./components/CustomerTable";

const Customers = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ status: "", customerType: "", hasDue: false, hasCreditBalance: false });
  const [sorting, setSorting] = useState({
    sortBy: "name",
    sortOrder: "asc",
  });
  const { hasPermission } = useAuth();
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission("CUSTOMER_VIEW_TABLE")) {
      showErrorToast("You don't have permission to view customers.");
      navigate("/");
    }
  }, [hasPermission, navigate]);

  const queryParams = {
    page,
    limit: 15,
    search: debouncedSearchTerm,
    status: filters.status || undefined,
    customerType: filters.customerType || undefined,
    hasDue: filters.hasDue ? "true" : undefined,
    hasCreditBalance: filters.hasCreditBalance ? "true" : undefined,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  };

  const {
    data: apiResponse,
    isLoading: loading,
    isError,
    error,
  } = useCustomerSummary(queryParams);

  const { data: statsResponse, isLoading: statsLoading } = useCustomerStats();

  const customers =
    apiResponse?.data?.customers || apiResponse?.customers || [];
  const totalPages =
    apiResponse?.data?.totalPages || apiResponse?.totalPages || 1;
  const totalItems =
    apiResponse?.data?.totalItems || apiResponse?.totalItems || 0;

  const stats = statsResponse?.data || {};

  useEffect(() => {
    if (isError) {
      showErrorToast(error, "Could not load customers. Please try again.");
    }
  }, [isError, error]);

  // --- Handlers ---
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((val) => {
    setFilters((prev) => ({ ...prev, status: val }));
    setPage(1);
  }, []);

  const handleTypeChange = useCallback((val) => {
    setFilters((prev) => ({ ...prev, customerType: val }));
    setPage(1);
  }, []);

  const handleSortChange = useCallback((field, order) => {
    setSorting({ sortBy: field, sortOrder: order });
    setPage(1);
  }, []);

  const handleToggleFilter = useCallback((key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ status: "", customerType: "", hasDue: false, hasCreditBalance: false });
    setSearchTerm("");
    setSorting({ sortBy: "name", sortOrder: "asc" });
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const hasActiveFilters = !!(
    filters.status ||
    filters.customerType ||
    filters.hasDue ||
    filters.hasCreditBalance ||
    searchTerm
  );

  return (
    <motion.div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Customers
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
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
                <Trash className="w-4 h-4" /> Trash
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
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stat Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatBox
          title="Total Customers"
          Icon={Users}
          number={stats.totalCustomers || 0}
          loading={statsLoading}
        />
        <StatBox
          title="Active"
          Icon={UserCheck}
          number={stats.active || 0}
          textColor="green"
          loading={statsLoading}
        />
        <StatBox
          title="Suspended"
          Icon={UserX}
          number={stats.suspended || 0}
          textColor="red"
          loading={statsLoading}
        />
        <StatBox
          title="Retail / Wholesale"
          Icon={Store}
          number={`${stats.retail || 0} / ${stats.wholesale || 0}`}
          loading={statsLoading}
        />
        <StatBox
          title="Outstanding Due"
          Icon={DollarSign}
          number={formatCurrency(stats.totalOutstandingDue || 0)}
          textColor="red"
          loading={statsLoading}
        />
        <StatBox
          title="Credit Balance"
          Icon={Wallet}
          number={formatCurrency(stats.totalCreditBalance || 0)}
          textColor="blue"
          loading={statsLoading}
        />
      </div>

      {/* Customer Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          onPageChange: handlePageChange,
          limit: 15,
        }}
        searchQuery={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filters.status}
        onStatusChange={handleStatusChange}
        filterType={filters.customerType}
        onTypeChange={handleTypeChange}
        hasDue={filters.hasDue}
        hasCreditBalance={filters.hasCreditBalance}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        sortBy={sorting.sortBy}
        sortOrder={sorting.sortOrder}
        onSortChange={handleSortChange}
      />
    </motion.div>
  );
};

export default Customers;
