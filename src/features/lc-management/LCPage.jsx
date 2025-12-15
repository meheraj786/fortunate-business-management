// LC.jsx
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
  Loader2,
} from "lucide-react";
import api from "@/services/apiService";
import { Link } from "react-router";
import { exportToExcel } from "@/lib/exportXlsx";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  const [lcCounts, setLcCounts] = useState({
    Active: 0,
    Completed: 0,
    Draft: 0,
    Cancelled: 0,
  });

  const fetchLcSummary = useCallback(
    async (page, limit, query, status, sortby, order) => {
      setLoading(true);
      try {
        const isSearchOrFilter = query || status;
        const endpoint = isSearchOrFilter ? `/lc/summary/search` : `/lc/summary`;
        const params = { page, limit };

        if (query) {
          params.searchQuery = query;
        }
        if (status) {
          params.status = status;
        }
        if (sortby) {
          params.sortBy = sortby;
          params.sortOrder = order;
        }

        const response = await api.get(endpoint, { params });
        const { data, pagination: newPagination } = response.data.data;
        if (Array.isArray(data)) {
          setLcData(data);
          setPagination(newPagination);
        } else {
          setLcData([]);
          toast.error("Failed to load LC data");
        }
      } catch (error) {
        console.error("Error fetching LC summary:", error);
        toast.error("Could not fetch LC data.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLcSummary(
      pagination.currentPage,
      pagination.limit,
      debouncedSearchQuery,
      filterStatus,
      sortBy,
      sortOrder
    );
  }, [
    fetchLcSummary,
    pagination.currentPage,
    pagination.limit,
    debouncedSearchQuery,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    api
      .get(`/lc/counts/status`)
      .then((res) => {
        if (res.data && res.data.data) {
          setLcCounts({
            Active: res.data.data.Active || 0,
            Completed: res.data.data.Completed || 0,
            Draft: res.data.data.Draft || 0,
            Cancelled: res.data.data.Cancelled || 0,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching LC counts:", error);
        toast.error("Could not fetch LC statistics.");
      });
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
  };

  const handleSortChange = (column) => {
    // If clicking the same column, toggle sort order
    if (sortBy === column) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      // If clicking a new column, set it as sortBy and default to desc order
      setSortBy(column);
      setSortOrder("desc");
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on sort change
  };

  const formatDateForExport = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    return date.toLocaleDateString();
  };

  const handleExport = async () => {
    const toastId = toast.loading("Preparing data for export...");

    try {
      const isSearchOrFilter = debouncedSearchQuery || filterStatus;
      const endpoint = isSearchOrFilter ? `/lc/summary/search` : `/lc/summary`;
      const params = {
        limit: pagination.totalDocuments, // To export all found documents
        sortBy,
        sortOrder,
      };
      if (debouncedSearchQuery) {
        params.searchQuery = debouncedSearchQuery;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }

      const allDataResponse = await api.get(endpoint, { params });

      if (!allDataResponse.data.data.data) {
        toast.error("Could not fetch all data for export.", { id: toastId });
        return;
      }

      const formattedData = allDataResponse.data.data.data.map((lc) => ({
        LC_Number: lc.lcNumber || "N/A",
        Status: lc.status || "N/A",
        Supplier: lc.supplierName || "N/A",
        Opening_Date: formatDateForExport(lc.lcOpeningDate),
        Arrival_Date: formatDateForExport(lc.dueDate),
        Products:
          lc.products
            ?.map((p) => `${p.itemName} (${p.quantity} ${p.unit})`)
            .join(", ") || "No products",
        Total_Quantity:
          lc.products?.reduce((acc, item) => acc + (item.quantity || 0), 0) ||
          0,
        Total_Cost_BDT: lc.totalCost || 0,
      }));

      const today = new Date().toISOString().split("T")[0];
      exportToExcel(
        formattedData,
        `LC_Report_${today}.xlsx`,
        `LC Data ${today}`
      );
      toast.success("LC Table Exported As XLSX", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data.", { id: toastId });
    }
  };

  return (
    <div>
      {/* Header with buttons */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Letters of Credit
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Overview of all registered LCs within your organization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              <Grid2x2Check size={20} />
              <span>Export XLSX</span>
            </button>
            <Link to="/lc-form" className="sm:w-auto w-full">
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors w-full">
                <Plus size={20} />
                <span>Add LC</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
            title="Canceled LC"
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
