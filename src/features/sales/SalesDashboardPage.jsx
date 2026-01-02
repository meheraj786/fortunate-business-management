import React, { useState, useCallback } from "react";
import {
  Plus,
  FileWarning,
  FileClock,
  FileCheck,
  FileX,
  Trash,
} from "lucide-react";
import { Link } from "react-router"; // Changed to react-router

import AddSalesForm from "./AddSalesForm";
import SalesTable from "./components/SalesTable";
import SalesStatCard from "./components/SalesStatCard";
import SalesDashboardSkeleton from "./components/SalesDashboardSkeleton";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button"; // Import Button component

import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedSales, useInvoiceStatusCount } from "@/api/hooks/sales";
import Pagination from "@/components/ui/Pagination";

const Sales = () => {
  const [showAddSale, setShowAddSale] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("saleDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { isSuperAdmin } = useAuth();

  const {
    data: salesResponse,
    isLoading: salesLoading,
    isError,
    error,
  } = usePaginatedSales({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearchTerm,
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

  if (salesLoading || statsLoading) {
    return <SalesDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-[var(--color-danger)] text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Sales Data
          </h3>
          <p className="text-[var(--color-danger)] mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowAddSale(true)}
              variant="primary"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              aria-label="Add new sale"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Add Sale
            </Button>
            {isSuperAdmin && (
              <Link to="/trash/sale" className="sm:w-auto w-full">
                <Button
                  variant="secondary" // Changed to secondary variant
                  className="inline-flex items-center justify-center gap-2 w-full"
                >
                  <Trash className="text-[var(--color-danger)]" size={20} />{" "}
                  View Sale Trash
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  All Sales Records
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {totalSales?.toLocaleString()} total records
                </p>
              </div>
              <div className="w-full sm:w-64">
                <SearchBar
                  onSearch={setSearchTerm}
                  placeholder="Search sales..."
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <SalesTable
                sales={salesData}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
