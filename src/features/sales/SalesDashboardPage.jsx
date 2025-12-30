import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  FileWarning,
  FileClock,
  FileCheck,
  FileX,
  Download,
  Trash,
} from "lucide-react";
import AddSalesForm from "./AddSalesForm";
import SalesTable from "./components/SalesTable";
import SalesStatCard from "./components/SalesStatCard";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import SearchBar from "@/components/ui/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [salesStats, setSalesStats] = useState({
    notInvoiced: 0,
    due: 0,
    paid: 0,
    cancelled: 0,
  });
  const [showAddSale, setShowAddSale] = useState(false);
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
  const {isSuperAdmin}=useAuth();

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesResponse, statsResponse] = await Promise.all([
        api.get(`/sales/sales-summary-table`, {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm,
            sortBy,
            sortOrder,
          },
        }),
        api.get(`/sales/get-all-invoices-status-count`),
      ]);

      if (salesResponse.data.success) {
        const { sales, totalSales, page, limit, totalPages } =
          salesResponse.data.data;
        setSalesData(Array.isArray(sales) ? sales : []);
        setPagination({ totalSales, page, limit, totalPages });
      } else {
        throw new Error("Failed to fetch sales data");
      }

      if (statsResponse.data?.data) {
        setSalesStats({
          notInvoiced: statsResponse.data.data.notInvoiced || 0,
          due: statsResponse.data.data.due || 0,
          paid: statsResponse.data.data.paid || 0,
          cancelled: statsResponse.data.data.cancelled || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setError(error.message || "Could not fetch sales data");
      toast.error("Could not fetch sales data");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleSaleAdded = useCallback(() => {
    setShowAddSale(false);
    fetchSalesData();
  }, [fetchSalesData]);

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
            Error Loading Sales Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSalesData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
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

      {/* Header Section */}
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
            <button
              onClick={() => setShowAddSale(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors active:scale-95 touch-manipulation"
              aria-label="Add new sale"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Sale
            </button>
                      {isSuperAdmin && (
            <Link to="/trash/sale">
            <button
              className="  px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 w-full sm:w-auto justify-center shadow-sm hover:shadow-md active:scale-95"
            >
              <Trash color="red" size={20} />
              Sale Trash
            </button>
            </Link>
          )}
          </div>
        </div>

        {/* Stats Cards */}
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

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  All Sales Records
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.totalSales?.toLocaleString()} total records
                </p>
              </div>
              <div className="w-full sm:w-64">
                <SearchBar
                  onSearch={setSearchTerm}
                  placeholder="Search sales..."
                  debounceDelay={300}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <SalesTable
                sales={salesData}
                isLoading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{pagination.page}</span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
                      aria-label="Previous page"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-700 px-2">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
                      aria-label="Next page"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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

export default Sales;

