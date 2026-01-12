import React from "react";
import { Link } from "react-router";
import {
  Grid2x2Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import Pagination from "../../../components/ui/Pagination";

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

  const SortIcon = React.useCallback(
    ({ column }) => {
      if (sortBy === column) {
        return sortOrder === "asc" ? (
          <ArrowUp size={14} className="ml-1" aria-hidden="true" />
        ) : (
          <ArrowDown size={14} className="ml-1" aria-hidden="true" />
        );
      }
      return null;
    },
    [sortBy, sortOrder],
  );

  const {
    currentPage = 1,
    totalPages = 1,
    totalDocuments = 0,
    limit = 10,
  } = pagination;

  const renderTableContent = React.useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-16">
            <Loader2
              className="mx-auto animate-spin h-8 w-8 text-[var(--color-primary)]"
              aria-label="Loading"
            />
            <p className="mt-2 text-sm text-gray-500">Loading LC data...</p>
          </td>
        </tr>
      );
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
        <tr key={lc._id} className="hover:bg-gray-50 transition-colors group">
          <td className="py-4 pl-4 pr-3 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
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
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500">
            {lc.supplierName || "N/A"}
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-center">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                lc.status,
              )}`}
            >
              {lc.status || "N/A"}
            </span>
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
            {lc.lcOpeningDate
              ? new Date(lc.lcOpeningDate).toLocaleDateString()
              : "N/A"}
          </td>
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
            {lc.dueDate ? new Date(lc.dueDate).toLocaleDateString() : "N/A"}
          </td>
          <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
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
          <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 text-right">
            {totalQuantity.toLocaleString()}
            {unitString}
          </td>
          <td className="py-4 pl-4 pr-4 text-sm whitespace-nowrap font-medium text-gray-900 text-right sm:pr-6">
            ৳{(lc.totalCost || 0).toLocaleString()}
          </td>
        </tr>
      );
    });
  }, [lcData, loading, getStatusColor]);

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
          <div className="text-center py-8">
            <Loader2
              className="mx-auto animate-spin h-8 w-8 text-[var(--color-primary)]"
              aria-label="Loading"
            />
            <p className="mt-2 text-sm text-gray-500">Loading LC data...</p>
          </div>
        ) : lcData.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
            <Grid2x2Check className="mx-auto w-10 h-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-500">
              No LC records found
            </p>
          </div>
        ) : (
          lcData.map((lc) => (
            <div
              key={lc._id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow relative"
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
                    ? new Date(lc.lcOpeningDate).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="text-right">
                  <span className="block text-xs text-gray-400">
                    Total Cost
                  </span>
                  <span className="font-semibold text-gray-900">
                    ৳{(lc.totalCost || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="truncate max-w-[70%]">
                  {lc.products?.length || 0} Products
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-2 lg:px-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  <Button
                    variant="subtle"
                    onClick={() => onSortChange("lcNumber")}
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    aria-label={`Sort by LC Number ${
                      sortBy === "lcNumber"
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : ""
                    }`}
                  >
                    LC Number
                    <SortIcon column="lcNumber" />
                  </Button>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[150px]"
                >
                  <Button
                    variant="subtle"
                    onClick={() => onSortChange("supplierName")}
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    aria-label={`Sort by Supplier ${
                      sortBy === "supplierName"
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : ""
                    }`}
                  >
                    Supplier
                    <SortIcon column="supplierName" />
                  </Button>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900 w-1/12"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  <Button
                    variant="subtle"
                    onClick={() => onSortChange("openingDate")}
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    aria-label={`Sort by Opening Date ${
                      sortBy === "openingDate"
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : ""
                    }`}
                  >
                    Opening Date
                    <SortIcon column="openingDate" />
                  </Button>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  <Button
                    variant="subtle"
                    onClick={() => onSortChange("dueDate")}
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    aria-label={`Sort by Due Date ${
                      sortBy === "dueDate"
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : ""
                    }`}
                  >
                    Due Date
                    <SortIcon column="dueDate" />
                  </Button>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Products
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-6"
                >
                  <Button
                    variant="subtle"
                    onClick={() => onSortChange("totalCost")}
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    aria-label={`Sort by Total Cost ${
                      sortBy === "totalCost"
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : ""
                    }`}
                  >
                    Total (৳)
                    <SortIcon column="totalCost" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {renderTableContent}
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
