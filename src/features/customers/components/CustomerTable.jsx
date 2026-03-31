import React from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/ui/Pagination";
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getCustomerById } from "@/api/customer.api";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import CustomerTypePill from "@/components/ui/CustomerTypePill";


// --- Shared cell padding classes for perfect alignment ---
const COL = {
  customer: "py-3 pl-5 pr-3",
  phone: "py-3 px-3",
  typeStatus: "py-3 px-3",
  due: "py-3 px-3",
  credit: "py-3 pl-3 pr-5",
};

const GRID_COLS = "2fr 1fr 1fr 1fr 1fr";

// --- Sortable Header ---
const SortableHeader = ({
  label,
  value,
  align = "left",
  sortBy,
  sortOrder,
  onSort,
}) => {
  const isSorted = sortBy === value;

  // For right-aligned headers, reverse flex direction so icon goes LEFT of text,
  // keeping the label text flush against the right edge (matching data cell alignment)
  const isRight = align === "right";
  const justifyClass = isRight
    ? "justify-end flex-row-reverse"
    : align === "center"
    ? "justify-center"
    : "justify-start";

  return (
    <button
      onClick={() => onSort(value)}
      className={`flex items-center gap-1 whitespace-nowrap hover:text-[var(--color-primary)] transition-colors w-full group outline-none ${justifyClass}`}
      aria-label={`Sort by ${label} ${
        isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : ""
      }`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isSorted ? "text-[var(--color-primary)]" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`flex-shrink-0 transition-opacity ${
          isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        }`}
      >
        {isSorted && sortOrder === "asc" ? (
          <ArrowUp size={13} className="text-[var(--color-primary)]" />
        ) : isSorted && sortOrder === "desc" ? (
          <ArrowDown size={13} className="text-[var(--color-primary)]" />
        ) : (
          <ArrowUpDown size={13} />
        )}
      </span>
    </button>
  );
};

// --- Non-sortable Header ---
const StaticHeader = ({ label, align = "left" }) => (
  <span
    className={`text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap block ${
      align === "right"
        ? "text-right"
        : align === "center"
        ? "text-center"
        : "text-left"
    }`}
  >
    {label}
  </span>
);

// --- Skeleton Row ---
const TableSkeletonRow = () => (
  <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: GRID_COLS }}>
    <div className={`${COL.customer}`}>
      <div className="space-y-1.5">
        <ValueSkeleton width="w-32" height="h-4" />
        <ValueSkeleton width="w-20" height="h-3" />
      </div>
    </div>
    <div className={`${COL.phone}`}>
      <ValueSkeleton width="w-24" height="h-4" />
    </div>
    <div className={`${COL.typeStatus} text-center`}>
      <div className="flex items-center justify-center gap-1.5">
        <ValueSkeleton width="w-16" height="h-5" className="rounded-full" />
        <ValueSkeleton width="w-14" height="h-5" className="rounded-full" />
      </div>
    </div>
    <div className={`${COL.due} text-right`}>
      <ValueSkeleton width="w-20" height="h-4" className="ml-auto" />
    </div>
    <div className={`${COL.credit} text-right`}>
      <ValueSkeleton width="w-20" height="h-4" className="ml-auto" />
    </div>
  </div>
);


const CustomerTable = ({
  customers = [],
  pagination = {},
  loading = false,
  searchQuery = "",
  onSearchChange,
  filterStatus = "",
  onStatusChange,
  filterType = "",
  onTypeChange,
  hasDue = false,
  hasCreditBalance = false,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters = false,
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
}) => {
  const { hasPermission } = useAuth();
  const { formatCurrency } = useSettings();
  const queryClient = useQueryClient();

  const canViewDetails = hasPermission("CUSTOMER_VIEW_DETAILS");
  const canViewSensitive =
    hasPermission("CUSTOMER_VIEW_SENSITIVE") ||
    hasPermission("CUSTOMER_UPDATE");

  const prefetchCustomerDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["customers", id],
      queryFn: async () => (await getCustomerById(id)).data,
      staleTime: 5 * 60 * 1000,
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      const defaultOrder = ["totalSpent", "totalDue", "creditBalance"].includes(
        field
      )
        ? "desc"
        : "asc";
      onSortChange(field, defaultOrder);
    }
  };

  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    onPageChange,
    limit = 15,
  } = pagination;

  // --- Table Content ---
  const renderTableContent = React.useMemo(() => {
    if (loading) {
      return Array.from({ length: limit }).map((_, i) => (
        <TableSkeletonRow key={`skeleton-${i}`} />
      ));
    }

    if (customers.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <Users
            className="mx-auto w-12 h-12 text-gray-300"
            aria-hidden="true"
          />
          <p className="mt-4 text-base font-medium text-gray-500">
            No customers found
          </p>
          <p className="text-sm mt-1 text-gray-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Get started by adding your first customer."}
          </p>
        </div>
      );
    }

    return customers.map((customer) => {
      const totalDue = customer.totalDue || 0;
      const creditBalance = customer.creditBalance || 0;

      return (
        <motion.div
          key={customer._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`grid border-b border-gray-100 hover:bg-gray-50/80 transition-colors group ${
            canViewDetails ? "cursor-pointer" : ""
          }`}
          style={{ gridTemplateColumns: GRID_COLS }}
          transition={{ duration: 0.12 }}
          onMouseEnter={() => prefetchCustomerDetails(customer._id)}
        >
          {/* Col 1: Customer (Name + ID) */}
          <div className={`${COL.customer}`}>
            <div className="min-w-0">
              {canViewDetails ? (
                <Link
                  to={`/customer-details/${customer._id}`}
                  className="block group/link"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover/link:text-[var(--color-primary)] transition-colors">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {customer.customerId || customer._id?.slice(-6)}
                  </p>
                </Link>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {customer.customerId || customer._id?.slice(-6)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Col 2: Phone */}
          <div
            className={`${COL.phone} text-sm whitespace-nowrap flex items-center`}
          >
            {canViewSensitive ? (
              customer.phone ? (
                <a
                  href={`tel:${customer.phone}`}
                  className="text-gray-600 hover:text-[var(--color-primary)] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {customer.phone}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )
            ) : (
              <span className="text-gray-400">***-****</span>
            )}
          </div>

          {/* Col 3: Type / Status */}
          <div className={`${COL.typeStatus} text-center flex items-center justify-center`}>
            <div className="flex items-center justify-center gap-1.5">
              {customer.customerType && (
                <CustomerTypePill type={customer.customerType} />
              )}
              {customer.customerStatus && (
                <StatusBadge
                  status={customer.customerStatus}
                  size="sm"
                  showIcon={false}
                />
              )}
            </div>
          </div>

          {/* Col 4: Total Due */}
          <div
            className={`${COL.due} text-sm whitespace-nowrap text-right flex items-center justify-end`}
          >
            <span
              className={`font-medium ${
                totalDue > 0 ? "text-[var(--color-danger)]" : "text-gray-400"
              }`}
            >
              {formatCurrency(totalDue)}
            </span>
          </div>

          {/* Col 5: Credit Balance */}
          <div
            className={`${COL.credit} text-sm whitespace-nowrap text-right flex items-center justify-end`}
          >
            <span
              className={`font-medium ${
                creditBalance > 0
                  ? "text-[var(--color-primary)]"
                  : "text-gray-400"
              }`}
            >
              {formatCurrency(creditBalance)}
            </span>
          </div>
        </motion.div>
      );
    });
  }, [
    customers,
    loading,
    canViewDetails,
    canViewSensitive,
    formatCurrency,
    hasActiveFilters,
    limit,
  ]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Toolbar: Search + Filter Chips */}
      <div className="p-3 sm:p-4 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="customer-table-search" className="sr-only">
            Search customers...
          </label>
          <input
            id="customer-table-search"
            type="text"
            placeholder="Search by name, phone, or ID..."
            className="w-full pl-9 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm bg-white placeholder-gray-400"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>

        {/* Filter Chips Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Chips */}
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Status</span>
          {[
            { value: "", label: "All" },
            { value: "Active", label: "Active" },
            { value: "Suspended", label: "Suspended" },
          ].map((opt) => (
            <button
              key={`status-${opt.value}`}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 outline-none ${
                filterStatus === opt.value
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Divider */}
          <span className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

          {/* Type Chips */}
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Type</span>
          {[
            { value: "", label: "All" },
            { value: "Retail", label: "Retail" },
            { value: "Wholesale", label: "Wholesale" },
          ].map((opt) => (
            <button
              key={`type-${opt.value}`}
              onClick={() => onTypeChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 outline-none ${
                filterType === opt.value
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Divider */}
          <span className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

          {/* Quick Filters */}
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Show</span>
          <button
            onClick={() => onToggleFilter("hasDue")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 outline-none ${
              hasDue
                ? "bg-[var(--color-danger)] text-white border-[var(--color-danger)] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            Has Due
          </button>
          <button
            onClick={() => onToggleFilter("hasCreditBalance")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 outline-none ${
              hasCreditBalance
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            Has Credit
          </button>

          {/* Clear All — appears when filters active */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={onClearFilters}
                className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-[var(--color-danger)] border border-red-200 hover:bg-red-100 transition-colors outline-none"
              >
                <X size={12} strokeWidth={2.5} />
                Clear all
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header Row */}
          <div
            className="grid bg-gray-50/80 border-b border-gray-200"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}
          >
            <div className={`${COL.customer}`}>
              <SortableHeader
                label="Customer"
                value="name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
            <div className={`${COL.phone}`}>
              <StaticHeader label="Phone" />
            </div>
            <div className={`${COL.typeStatus} text-center`}>
              <StaticHeader label="Type / Status" align="center" />
            </div>
            <div className={`${COL.due} text-right`}>
              <SortableHeader
                label="Due"
                value="totalDue"
                align="right"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
            <div className={`${COL.credit} text-right`}>
              <SortableHeader
                label="Credit"
                value="creditBalance"
                align="right"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          </div>

          {/* Body Rows */}
          <div>
            <AnimatePresence initial={false}>
              {renderTableContent}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isLoading={loading}
            totalItems={totalItems}
            itemsPerPage={limit}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomerTable);
