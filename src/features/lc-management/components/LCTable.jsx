// LCTable.jsx
import React from "react";
import { Link } from "react-router";
import {
  Grid2x2Check,
  Search,
  Filter,
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
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
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
  };

  const { currentPage, totalPages, totalDocuments, limit = 10 } = pagination;
  const startDocument = totalDocuments === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endDocument = Math.min(currentPage * limit, totalDocuments);

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startDocument}</span> to{" "}
          <span className="font-medium">{endDocument}</span> of{" "}
          <span className="font-medium">{totalDocuments}</span> results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    );
  };

  const SortIcon = ({ column }) => {
    if (sortBy === column) {
      return sortOrder === "asc" ? (
        <ArrowUp size={14} className="ml-1" />
      ) : (
        <ArrowDown size={14} className="ml-1" />
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search LC number, supplier, or products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={onStatusChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base appearance-none bg-white pr-8"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  <button
                    className="flex items-center whitespace-nowrap"
                    onClick={() => onSortChange("lcNumber")}
                  >
                    LC Number
                    <SortIcon column="lcNumber" />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    className="flex items-center whitespace-nowrap"
                    onClick={() => onSortChange("supplierName")}
                  >
                    Supplier
                    <SortIcon column="supplierName" />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  <button
                    className="flex items-center whitespace-nowrap mx-auto"
                    onClick={() => onSortChange("openingDate")}
                  >
                    Opening Date
                    <SortIcon column="openingDate" />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  <button
                    className="flex items-center whitespace-nowrap mx-auto"
                    onClick={() => onSortChange("dueDate")}
                  >
                    Due Date
                    <SortIcon column="dueDate" />
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Products
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    className="flex items-center whitespace-nowrap"
                    onClick={() => onSortChange("totalCost")}
                  >
                    Total (BDT)
                    <SortIcon column="totalCost" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <Loader2 className="mx-auto animate-spin h-8 w-8 text-blue-500" />
                  </td>
                </tr>
              ) : lcData.length > 0 ? (
                lcData.map((lc) => (
                  <tr
                    key={lc._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                      <Link
                        to={`/lc-details/${lc._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {lc.lcNumber || "N/A"}
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      {lc.supplierName || "N/A"}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          lc.status
                        )}`}
                      >
                        {lc.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
                      {new Date(lc.lcOpeningDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
                      {lc.dueDate
                        ? new Date(lc.dueDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                      {lc.products?.map((product, idx) => (
                        <div key={idx} className="mb-1 last:mb-0">
                          {product.itemName || "Unnamed"}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
                      {(() => {
                        const totalQuantity = lc.products?.reduce(
                          (acc, item) => acc + (item.quantity || 0),
                          0
                        );
                        const units = new Set(
                          lc.products?.map((p) => p.unit).filter(Boolean)
                        );
                        const unitString =
                          units.size === 1 ? ` ${Array.from(units)[0]}` : "";
                        return `${totalQuantity?.toLocaleString() || 0}${unitString}`;
                      })()}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap font-medium text-gray-900">
                      {lc.totalCost?.toLocaleString() || "0"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <Grid2x2Check className="mx-auto w-12 h-12 text-gray-400" />
                    <p className="mt-4 text-base text-gray-500">
                      No LC records found
                    </p>
                    <p className="text-sm mt-1 text-gray-500">
                      Please try a different search term or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">{renderPagination()}</div>
    </div>
  );
};

export default LCTable;