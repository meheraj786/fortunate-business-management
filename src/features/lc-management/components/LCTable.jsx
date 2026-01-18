import React from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid2x2Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  Filter,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import Pagination from "@/components/ui/Pagination";
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getLCById } from "@/api/lc.api";
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const SortableHeader = ({
  label,
  value,
  align = "left",
  sortBy,
  sortOrder,
  onSort,
}) => {
  const isSorted = sortBy === value;

  return (
    <button
      onClick={() => onSort(value)}
      className={`flex items-center gap-1.5 whitespace-nowrap hover:text-[var(--color-primary)] transition-colors w-full group outline-none ${
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}
      aria-label={`Sort by ${label} ${
        isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : ""
      }`}
    >
      <span
        className={`text-sm font-semibold ${isSorted ? "text-[var(--color-primary)]" : "text-gray-900"}`}
      >
        {label}
      </span>
      <span
        className={`flex-shrink-0 transition-opacity ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
      >
        {isSorted && sortOrder === "asc" ? (
          <ArrowUp size={14} className="text-[var(--color-primary)]" />
        ) : isSorted && sortOrder === "desc" ? (
          <ArrowDown size={14} className="text-[var(--color-primary)]" />
        ) : (
          <ArrowUpDown size={14} />
        )}
      </span>
    </button>
  );
};

const TableSkeletonRow = () => (
  <tr>
    <td className="py-4 pl-4 pr-3 whitespace-nowrap sm:pl-6 border-b border-gray-100">
      <ValueSkeleton width="w-24" height="h-4" />
    </td>
    <td className="px-4 py-4 whitespace-nowrap border-b border-gray-100">
      <ValueSkeleton width="w-32" height="h-4" />
    </td>
    <td className="px-4 py-4 whitespace-nowrap border-b border-gray-100 text-center">
      <ValueSkeleton
        width="w-20"
        height="h-6"
        className="mx-auto rounded-full"
      />
    </td>
    <td className="px-4 py-4 whitespace-nowrap border-b border-gray-100 text-center">
      <ValueSkeleton width="w-24" height="h-4" className="mx-auto" />
    </td>
    <td className="px-4 py-4 whitespace-nowrap border-b border-gray-100 text-center">
      <ValueSkeleton width="w-24" height="h-4" className="mx-auto" />
    </td>
    <td className="px-4 py-4 border-b border-gray-100">
      <div className="space-y-1">
        <ValueSkeleton width="w-32" height="h-4" />
        <ValueSkeleton width="w-24" height="h-3" />
      </div>
    </td>
    <td className="px-4 py-4 whitespace-nowrap text-right border-b border-gray-100">
      <ValueSkeleton width="w-16" height="h-4" className="ml-auto" />
    </td>
    <td className="py-4 pl-4 pr-4 whitespace-nowrap text-right sm:pr-6 border-b border-gray-100">
      <ValueSkeleton width="w-20" height="h-4" className="ml-auto" />
    </td>
  </tr>
);

const LCTable = ({
  lcData = [],
  pagination = {},
  onPageChange,
  loading,
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  statusOptions,
}) => {
  const { hasPermission } = useAuth();
  const { formatCurrency, formatDate, formatNumber } = useSettings();
  const queryClient = useQueryClient();

  const prefetchLCDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["lcs", id],
      queryFn: async () => (await getLCById(id)).data,
      staleTime: 5 * 60 * 1000,
    });
  };

  const getStatusColor = React.useCallback((status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return "bg-[var(--color-success-light)] text-[var(--color-success)]";
      case "completed":
        return "bg-[var(--color-primary-light)] text-[var(--color-primary)]";
      case "cancelled":
        return "bg-[var(--color-danger-light)] text-[var(--color-danger)]";
      case "draft":
        return "bg-[var(--color-warning-light)] text-[var(--color-warning)]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const {
    currentPage = 1,
    totalPages = 1,
    totalDocuments = 0,
    limit = 10,
  } = pagination;

  const renderTableContent = React.useMemo(() => {
    if (loading) {
      return Array.from({ length: limit || 10 }).map((_, i) => (
        <TableSkeletonRow key={`skeleton-${i}`} />
      ));
    }

    if (lcData.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-16 px-4">
            <Grid2x2Check
              className="mx-auto w-12 h-12 text-gray-400"
              aria-hidden="true"
            />
            <p className="mt-4 text-base font-medium text-gray-500">
              No LC records found
            </p>
            <p className="text-sm mt-2 text-gray-400 max-w-md mx-auto">
              Try adjusting your search term or filter to find what you're
              looking for.
            </p>
          </td>
        </tr>
      );
    }

    return lcData.map((lc) => {
      const totalQuantity =
        lc.products?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
      const units = new Set(lc.products?.map((p) => p.unit).filter(Boolean));
      const unitString = units.size === 1 ? ` ${Array.from(units)[0]}` : "";

      return (
        <motion.tr
          key={lc._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="hover:bg-gray-50 transition-colors group"
          transition={{ duration: 0.12 }}
          onMouseEnter={() => prefetchLCDetails(lc._id)}
        >
          <td className="py-4 pl-4 pr-3 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 border-b border-gray-100">
            {hasPermission("LC_VIEW_DETAILS") ? (
              <Link
                to={`/lc-details/${lc._id}`}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                aria-label={`View LC ${lc.lcNumber || "details"}`}
              >
                {lc.lcNumber || "N/A"}
              </Link>
            ) : (
              <span className="text-gray-900">{lc.lcNumber || "N/A"}</span>
            )}
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 border-b border-gray-100">
            {lc.supplierName || "N/A"}
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-center border-b border-gray-100">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                lc.status,
              )}`}
            >
              {lc.status || "N/A"}
            </span>
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 text-center border-b border-gray-100">
            {lc.lcOpeningDate ? formatDate(lc.lcOpeningDate) : "N/A"}
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 text-center border-b border-gray-100">
            {lc.dueDate ? formatDate(lc.dueDate) : "N/A"}
          </td>
          <td className="px-4 py-4 text-sm text-gray-500 max-w-xs border-b border-gray-100">
            <div className="space-y-1">
              {lc.products?.slice(0, 2).map((product, idx) => (
                <div key={idx} className="truncate">
                  {product.itemName || "Unnamed Product"}
                </div>
              ))}
              {lc.products && lc.products.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{lc.products.length - 2} more
                </div>
              )}
            </div>
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 text-right border-b border-gray-100">
            {formatNumber(totalQuantity)}
            {unitString}
          </td>
          <td className="py-4 pl-4 pr-4 text-sm whitespace-nowrap font-medium text-gray-900 text-right sm:pr-6 border-b border-gray-100">
            {formatCurrency(lc.totalCost || 0)}
          </td>
        </motion.tr>
      );
    });
  }, [lcData, loading, getStatusColor, hasPermission]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="lc-search" className="sr-only">
              Search LC number, supplier, or products...
            </label>
            <input
              id="lc-search"
              type="text"
              placeholder="Search LC number, supplier, or products..."
              className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm bg-white placeholder-gray-500"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={onStatusChange}
              className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm appearance-none bg-white pr-10"
              aria-label="Filter by status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4 px-4 pb-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <ValueSkeleton width="w-24" height="h-5" />
                  <ValueSkeleton
                    width="w-16"
                    height="h-5"
                    className="rounded-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ValueSkeleton width="w-20" height="h-8" />
                  <ValueSkeleton
                    width="w-20"
                    height="h-8"
                    className="ml-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : lcData.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
            <Grid2x2Check className="mx-auto w-10 h-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-500">
              No LC records found
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Sorting Controls */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 mb-4 sticky top-16 z-10 bg-gray-50/95 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2 flex-1">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer w-full"
                >
                  <option value="lcNumber">LC Number</option>
                  <option value="supplierName">Supplier</option>
                  <option value="openingDate">Opening Date</option>
                  <option value="totalCost">Total Cost</option>
                </select>
              </div>
              <button
                onClick={() => onSortChange(sortBy)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-bold text-gray-700 shadow-sm active:scale-95 transition-all outline-none"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sortOrder}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    {sortOrder === "desc" ? (
                      <>
                        <ArrowDown
                          size={14}
                          className="text-[var(--color-primary)]"
                        />
                        DESC
                      </>
                    ) : (
                      <>
                        <ArrowUp
                          size={14}
                          className="text-[var(--color-primary)]"
                        />
                        ASC
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </motion.div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {lcData.map((lc) => (
                  <motion.div
                    key={lc._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative"
                    transition={{ duration: 0.12 }}
                    onMouseEnter={() => prefetchLCDetails(lc._id)}
                  >
                    {hasPermission("LC_VIEW_DETAILS") && (
                      <Link
                        to={`/lc-details/${lc._id}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View LC ${lc.lcNumber}`}
                      />
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-primary)]">
                          {lc.lcNumber || "N/A"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {lc.supplierName || "No Supplier"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          lc.status,
                        )}`}
                      >
                        {lc.status || "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="block text-xs text-gray-400">
                          Opening Date
                        </span>
                        {lc.lcOpeningDate
                          ? formatDate(lc.lcOpeningDate)
                          : "N/A"}
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-gray-400">
                          Total Cost
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(lc.totalCost || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="truncate max-w-[70%]">
                        {lc.products?.length || 0} Products
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-[1000px] w-full border-separate border-spacing-0">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 border-b border-gray-200"
                >
                  <SortableHeader
                    label="LC Number"
                    value="lcNumber"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSortChange}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[150px] border-b border-gray-200"
                >
                  <SortableHeader
                    label="Supplier"
                    value="supplierName"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSortChange}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900 w-1/12 border-b border-gray-200"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Opening Date"
                    value="openingDate"
                    align="center"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSortChange}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Due Date"
                    value="dueDate"
                    align="center"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSortChange}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  Products
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-6 border-b border-gray-200"
                >
                  <SortableHeader
                    label="Total Cost"
                    value="totalCost"
                    align="right"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSortChange}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white relative">
              <AnimatePresence initial={false}>
                {renderTableContent}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isLoading={loading}
            totalItems={totalDocuments}
            itemsPerPage={limit}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(LCTable);
