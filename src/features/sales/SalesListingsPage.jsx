import React, { useState, useEffect, useCallback } from "react";
import api from "@/services/apiService";
import SalesTable from "./components/SalesTable";
import SalesTableSkeleton from "./components/SalesTableSkeleton"; // Import the skeleton component
import SearchBar from "@/components/ui/SearchBar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SalesListPage = ({
  title,
  description,
  breadcrumbItems,
  initialFilters = {},
}) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalSales: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("saleDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        sortBy,
        sortOrder,
        ...initialFilters,
      };

      const response = await api.get("/sales/sales-summary-table", { params });

      if (response.data.success) {
        const { sales, totalSales, page, limit, totalPages } =
          response.data.data;
        setSales(Array.isArray(sales) ? sales : []);
        setPagination({ totalSales, page, limit, totalPages });
      } else {
        throw new Error(response.data.message || `Failed to load ${title}`);
      }
    } catch (error) {
      console.error(`Error fetching ${title}:`, error);
      setError(
        error.response?.data?.message ||
          error.message ||
          `Could not fetch ${title}.`
      );
      toast.error(error.response?.data?.message || `Could not fetch ${title}.`);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
    initialFilters,
    title,
  ]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder(field === "totalAmountToBePaid" ? "desc" : "desc");
      }
    },
    [sortBy]
  );

  if (error && !loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSales}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search by product, customer, or sale ID..."
                debounceDelay={500}
              />
            </div>

            <div className="min-h-[400px]">
              {loading ? (
                <SalesTableSkeleton />
              ) : (
                <SalesTable
                  sales={sales}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.totalSales
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination.totalSales?.toLocaleString()}
                    </span>{" "}
                    records
                  </div>

                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({
                        length: Math.min(5, pagination.totalPages),
                      }).map((_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                              pagination.page === pageNumber
                                ? "bg-primary text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            aria-label={`Go to page ${pageNumber}`}
                            aria-current={
                              pagination.page === pageNumber
                                ? "page"
                                : undefined
                            }
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesListPage;
