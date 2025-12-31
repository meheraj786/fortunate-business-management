import React, { useState, useEffect, useCallback } from "react";
import StatBox from "@/components/ui/StatBox";
import LCTable from "./components/LCTable";
import {
  BookmarkCheck,
  BookmarkX,
  Gpu,
  MonitorDot,
  Plus,
  Grid2x2Check,
} from "lucide-react";
import api from "@/services/apiService";
import { Link } from "react-router";
import { handleError } from "@/utils/handle-error";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";

const LC_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Draft", label: "Draft" },
  { value: "Cancelled", label: "Cancelled" },
];

const LC = () => {
  const [lcData, setLcData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const {isSuperAdmin}=useAuth();

  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [lcCounts, setLcCounts] = useState({
    Active: 0,
    Completed: 0,
    Draft: 0,
    Cancelled: 0,
  });

  const fetchLcData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isSearchOrFilter = searchQuery || filterStatus;
      const endpoint = isSearchOrFilter ? `/lc/summary/search` : `/lc/summary`;

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (searchQuery) params.searchQuery = searchQuery;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get(endpoint, { params });

      if (response.data?.success) {
        const { data, pagination: newPagination } = response.data.data;
        setLcData(Array.isArray(data) ? data : []);
        setPagination(newPagination || pagination);
      } else {
        throw new Error(response.data?.message || "Failed to load LC data");
      }
    } catch (error) {
      setError(error.message || "Could not fetch LC data.");
      handleError(error, "Could not fetch LC data.");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.limit,
    searchQuery,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  const fetchLcCounts = useCallback(async () => {
    try {
      const response = await api.get(`/lc/counts/status`);
      if (response.data?.data) {
        setLcCounts({
          Active: response.data.data.Active || 0,
          Completed: response.data.data.Completed || 0,
          Draft: response.data.data.Draft || 0,
          Cancelled: response.data.data.Cancelled || 0,
        });
      }
    } catch (error) {
      handleError(error, "Error fetching LC counts");
    }
  }, []);

  useEffect(() => {
    fetchLcData();
  }, [fetchLcData]);

  useEffect(() => {
    fetchLcCounts();
  }, [fetchLcCounts]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  if (error && !loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLcData}
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
      {/* Header */}
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
            {
              isSuperAdmin && 
                          <Link to="/trash/lc" className="sm:w-auto w-full" >LC Trash</Link>
            }

            <Link to="/lc-form" className="sm:w-auto w-full">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors w-full active:scale-95 touch-manipulation">
                <Plus size={20} aria-hidden="true" />
                <span>Add LC</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox
            title="Active LC"
            Icon={MonitorDot}
            number={lcCounts.Active}
            textColor="green"
          />
          <StatBox
            title="Completed LC"
            Icon={BookmarkCheck}
            number={lcCounts.Completed}
            textColor="blue"
          />
          <StatBox
            title="Draft LC"
            Icon={Gpu}
            number={lcCounts.Draft}
            textColor="yellow"
          />
          <StatBox
            title="Cancelled LC"
            Icon={BookmarkX}
            number={lcCounts.Cancelled}
            textColor="red"
          />
        </div>
      </div>

      {/* LC Table */}
      <div>
        <LCTable
          lcData={lcData}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
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
