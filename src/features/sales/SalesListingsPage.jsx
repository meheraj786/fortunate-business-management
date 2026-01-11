import React, { useState, useCallback, useMemo } from "react";
import { usePaginatedSales } from "@/api/hooks/sales";
import SalesTable from "./components/SalesTable";
import SalesTableSkeleton from "./components/SalesTableSkeleton";
import SearchBar from "@/components/ui/SearchBar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button"; // Import Button component

const SalesListPage = ({ title, description, breadcrumbItems, initialFilters = {} }) => {
  const [paginationState, setPaginationState] = useState({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("saleDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const params = useMemo(() => ({
    page: paginationState.page,
    limit: paginationState.limit,
    search: searchTerm,
    sortBy,
    sortOrder,
    ...initialFilters,
  }), [paginationState.page, paginationState.limit, searchTerm, sortBy, sortOrder, initialFilters]);

  const { data: response, isLoading, isError, error, refetch } = usePaginatedSales(params);

  const sales = response?.data?.sales || [];
  const { totalSales, totalPages } = response?.data || {};

  const handlePageChange = (newPage) => {
    setPaginationState(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = useCallback((field) => {
    setSortBy(currentSortBy => {
      if (currentSortBy === field) {
        setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
        return currentSortBy;
      } else {
        setSortOrder("desc");
        return field;
      }
    });
  }, []);

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-[var(--color-danger)] text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-[var(--color-danger)] mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{description}</p>
          </div>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <SearchBar onSearch={setSearchTerm} placeholder="Search by product, customer, or sale ID..." />
            </div>
            <div className="min-h-[400px]">
              {isLoading ? <SalesTableSkeleton /> : <SalesTable sales={sales} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={paginationState.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalSales}
                itemsPerPage={paginationState.limit}
                className="pt-4 border-t border-gray-200"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesListPage;
