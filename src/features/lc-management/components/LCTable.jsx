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
  const getStatusColor = React.useCallback((status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
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
    [sortBy, sortOrder]
  );

  const {
    currentPage = 1,
    totalPages = 1,
    totalDocuments = 0,
    limit = 10,
  } = pagination;
  const startDocument =
    totalDocuments === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endDocument = Math.min(currentPage * limit, totalDocuments);

  const renderPagination = React.useMemo(() => {
    if (!totalPages || totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 order-2 sm:order-1">
          Showing <span className="font-medium">{startDocument}</span> to{" "}
          <span className="font-medium">{endDocument}</span> of{" "}
          <span className="font-medium">
            {totalDocuments?.toLocaleString()}
          </span>{" "}
          results
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} className="mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="text-sm text-gray-700 px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} className="ml-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }, [
    currentPage,
    totalPages,
    startDocument,
    endDocument,
    totalDocuments,
    onPageChange,
  ]);

  const renderTableContent = React.useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-16">
            <Loader2
              className="mx-auto animate-spin h-8 w-8 text-blue-500"
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
            <Link
              to={`/lc-details/${lc._id}`}
              className="text-indigo-600 hover:text-indigo-900 font-medium"
              aria-label={`View LC ${lc.lcNumber || "details"}`}
            >
              {lc.lcNumber || "N/A"}
            </Link>
          </td>
          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
            {lc.supplierName || "N/A"}
          </td>
          <td className="px-3 py-4 text-sm whitespace-nowrap">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                lc.status
              )}`}
            >
              {lc.status || "N/A"}
            </span>
          </td>
          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
            {lc.lcOpeningDate
              ? new Date(lc.lcOpeningDate).toLocaleDateString()
              : "N/A"}
          </td>
          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
            {lc.dueDate ? new Date(lc.dueDate).toLocaleDateString() : "N/A"}
          </td>
          <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
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
          <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
            {totalQuantity.toLocaleString()}
            {unitString}
          </td>
          <td className="px-3 py-4 text-sm whitespace-nowrap font-medium text-gray-900">
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
            <input
              type="text"
              placeholder="Search LC number, supplier, or products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base bg-white placeholder-gray-500"
              value={searchQuery}
              onChange={onSearchChange}
              aria-label="Search LC records"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={onStatusChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base appearance-none bg-white pr-10"
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

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-2 lg:px-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider sm:pl-6"
                >
                  <button
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    onClick={() => onSortChange("lcNumber")}
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
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  <button
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    onClick={() => onSortChange("supplierName")}
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
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  <button
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    onClick={() => onSortChange("openingDate")}
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
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  <button
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    onClick={() => onSortChange("dueDate")}
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
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Products
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider"
                >
                  <button
                    className="flex items-center whitespace-nowrap hover:text-gray-700"
                    onClick={() => onSortChange("totalCost")}
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
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {renderTableContent}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">{renderPagination}</div>
    </div>
  );
};

export default React.memo(LCTable);
