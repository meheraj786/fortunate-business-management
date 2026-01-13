import React, { useState, useCallback } from "react";
import {
  Plus,
  FileWarning,
  FileClock,
  FileCheck,
  FileX,
  Trash,
} from "lucide-react";
import { Link } from "react-router"; 

import AddSalesForm from "./AddSalesForm";
import SalesTable from "./components/SalesTable";
import SalesStatCard from "./components/SalesStatCard";
import SalesTableSkeleton from "./components/SalesTableSkeleton";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { usePaginatedSales, useInvoiceStatusCount } from "@/api/hooks/sales";
import Pagination from "@/components/ui/Pagination";

const StatCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100">
        <div className="h-6 w-6 rounded-full bg-gray-200"></div>
      </div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const Sales = () => {
  const [showAddSale, setShowAddSale] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("saleDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const { hasPermission } = useAuth();

  const {
    data: salesResponse,
    isLoading: salesLoading,
    isError,
    error,
  } = usePaginatedSales({
    page: pagination.page,
    limit: pagination.limit,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const { data: statsResponse, isLoading: statsLoading } =
    useInvoiceStatusCount();

  const salesData = salesResponse?.data?.sales || [];
  const { totalSales, totalPages } = salesResponse?.data || {};

  const salesStats = {
    notInvoiced: statsResponse?.data?.notInvoiced || 0,
    due: statsResponse?.data?.due || 0,
    paid: statsResponse?.data?.paid || 0,
    cancelled: statsResponse?.data?.cancelled || 0,
  };

  const handleSaleAdded = useCallback(() => {
    setShowAddSale(false);
    // Invalidation will happen via the mutation hook, no need to manually refetch
  }, []);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = useCallback((field) => {
    setSortBy((currentSortBy) => {
      if (currentSortBy === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return currentSortBy;
      } else {
        setSortOrder("desc");
        return field;
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <AddSalesForm
        isOpen={showAddSale}
        onClose={() => setShowAddSale(false)}
        onSaleAdded={handleSaleAdded}
      />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sales Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your product sales in real-time
            </p>
          </div>
          <div className="flex gap-2">
            {hasPermission("SALE_CREATE") && (
              <Button
                onClick={() => setShowAddSale(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                <span>Add Sale</span>
              </Button>
            )}
            {hasPermission("TRASH_VIEW_SALE") && (
              <Link to="/trash/sale">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Trash className="text-[var(--color-danger)]" size={20} />{" "}
                  Sales Trash
                </Button>
              </Link>
            )}
          </div>
        </div>

        {hasPermission("SALE_VIEW_TABLE") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <SalesStatCard
                  title="Not Invoiced"
                  count={salesStats.notInvoiced}
                  linkTo="/sales/not-invoiced"
                  icon={FileWarning}
                  color="yellow"
                />
                <SalesStatCard
                  title="Due Invoices"
                  count={salesStats.due}
                  linkTo="/sales/due-invoices"
                  icon={FileClock}
                  color="orange"
                />
                <SalesStatCard
                  title="Paid Invoices"
                  count={salesStats.paid}
                  linkTo="/sales/paid-invoices"
                  icon={FileCheck}
                  color="green"
                />
                <SalesStatCard
                  title="Cancelled"
                  count={salesStats.cancelled}
                  linkTo="/sales/cancelled"
                  icon={FileX}
                  color="red"
                />
              </>
            )}
          </div>
        )}
      </div>

      {hasPermission("SALE_VIEW_TABLE") && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    All Sales Records
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {!salesLoading &&
                      !isError &&
                      `${totalSales?.toLocaleString()} total records`}
                  </p>
                </div>
                <div className="w-full sm:w-64">
                  <SearchBar
                    onSearch={setSearchTerm}
                    placeholder="Search sales..."
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 min-h-[400px]">
                {salesLoading ? (
                  <SalesTableSkeleton />
                ) : isError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="text-[var(--color-danger)] text-4xl mb-4">
                        ⚠️
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error Loading Sales Data
                      </h3>
                      <p className="text-[var(--color-danger)] mb-4">
                        {error.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <SalesTable
                      sales={salesData}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalSales}
                        itemsPerPage={pagination.limit}
                        className="pt-4 border-t border-gray-200"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
