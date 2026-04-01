import React, { useState } from "react";
import StatBox from "@/components/ui/StatBox";
import LCTable from "./components/LCTable";
import {
  BookmarkCheck,
  BookmarkX,
  Gpu,
  MonitorDot,
  Plus,
  Trash,
  DollarSign,
  Package,
} from "lucide-react";
import { Link } from "react-router"; // Changed to react-router
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { useLCSummary, useLCCountsByStatus } from "@/api/hooks/lc";
import Button from "@/components/ui/Button"; // Import Button component

const LC_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Draft", label: "Draft" },
  { value: "Cancelled", label: "Cancelled" },
];

const LC = () => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const { hasPermission } = useAuth();

  const lcSummaryParams = {
    page: pagination.page,
    limit: pagination.limit,
    sortBy,
    sortOrder,
    searchQuery: debouncedSearchQuery,
    status: filterStatus,
  };

  const {
    data: lcSummaryData,
    isLoading: isLcSummaryLoading,
    error: lcSummaryError,
    refetch: refetchLcSummary,
  } = useLCSummary(lcSummaryParams);
  const { data: lcCountsData, isLoading: isLcCountsLoading } =
    useLCCountsByStatus();

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (lcSummaryError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--color-danger)] mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-[var(--color-danger)] mb-4">
            {lcSummaryError.message}
          </p>
          <Button
            onClick={() => refetchLcSummary()}
            variant="primary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { data: lcData, pagination: paginationData } = lcSummaryData?.data || {
    data: [],
    pagination: {},
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Letters of Credit
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Overview of all registered LCs within your organization.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {hasPermission("TRASH_VIEW_LC") && (
              <Link to="/trash/lc" className="sm:w-auto w-full">
                <Button
                  variant="danger" // Changed to danger variant
                  size="sm"
                  className="inline-flex items-center justify-center gap-2 w-full"
                >
                  <Trash size={20} aria-hidden="true" />
                  <span>View LC Trash</span>
                </Button>
              </Link>
            )}
            {hasPermission("LC_CREATE") && (
              <Link to="/lc-form" className="sm:w-auto w-full">
                <Button
                  variant="primary" // Changed to primary variant
                  size="sm"
                  className="inline-flex items-center justify-center gap-2 w-full"
                >
                  <Plus size={20} aria-hidden="true" />
                  <span>Add LC</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatBox
            title="Active LC"
            Icon={MonitorDot}
            number={lcCountsData?.data?.Active || 0}
            textColor="success"
            loading={isLcCountsLoading}
          />
          <StatBox
            title="Draft LC"
            Icon={Gpu}
            number={lcCountsData?.data?.Draft || 0}
            textColor="warning"
            loading={isLcCountsLoading}
          />
          <StatBox
            title="Completed LC"
            Icon={BookmarkCheck}
            number={lcCountsData?.data?.Completed || 0}
            textColor="primary"
            loading={isLcCountsLoading}
          />
          <StatBox
            title="Cancelled LC"
            Icon={BookmarkX}
            number={lcCountsData?.data?.Cancelled || 0}
            textColor="danger"
            loading={isLcCountsLoading}
          />
          <StatBox
            title={`Total Cost (${lcCountsData?.data?.currency || "BDT"})`}
            Icon={DollarSign}
            number={
              lcCountsData?.data?.activeDraftTotalCost
                ? new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(lcCountsData.data.activeDraftTotalCost)
                : "0"
            }
            textColor="default"
            loading={isLcCountsLoading}
          />
          <StatBox
            title="Total Product Qty"
            Icon={Package}
            number={
              lcCountsData?.data?.activeDraftQuantityByUnit?.length > 0
                ? lcCountsData.data.activeDraftQuantityByUnit
                    .map((u) => {
                      const qty = u.totalBaseQuantity || 0;
                      if (u.unitType === "Weight") {
                        // base unit is KG; show TON if ≥ 1000
                        if (qty >= 1000) {
                          return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(qty / 1000)} TON`;
                        }
                        return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(qty)} KG`;
                      }
                      // For Count, Volume, Length — just show the number with type
                      return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(qty)} ${u.unitType}`;
                    })
                    .join(", ")
                : "0"
            }
            textColor="default"
            loading={isLcCountsLoading}
          />
        </div>
      </div>
      <div>
        <LCTable
          lcData={lcData}
          pagination={paginationData}
          onPageChange={handlePageChange}
          loading={isLcSummaryLoading}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filterStatus={filterStatus}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          statusOptions={LC_STATUS_OPTIONS}
        />
      </div>
    </div>
  );
};

export default LC;
