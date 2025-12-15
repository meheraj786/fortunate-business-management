import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FileWarning,
  FileClock,
  FileCheck,
  FileX,
  Download,
} from "lucide-react";
import AddSalesForm from "./AddSalesForm";
import SalesTable from "./components/SalesTable";
import SalesStatCard from "./components/SalesStatCard";
import api from "@/services/apiService";
import { exportToExcel } from "@/lib/exportXlsx";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import SearchBar from "@/components/ui/SearchBar";

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
  
    const fetchSalesAndStats = useCallback(() => {
      setLoading(true);
      // Fetch paginated sales
      api
        .get(`/sales/sales-summary-table`, {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm,
            sortBy,
            sortOrder,
          },
        })
        .then((res) => {
          if (res.data.success) {
            const { sales, totalSales, page, limit, totalPages } =
              res.data.data;
            setSalesData(sales);
            setPagination({ totalSales, page, limit, totalPages });
          } else {
            toast.error("Could not fetch sales data.");
          }
        })
        .catch((error) => {
          console.error("Error fetching sales:", error);
          toast.error("Could not fetch sales data.");
        })
        .finally(() => setLoading(false));
  
      // Fetch sales stats
      api
        .get(`/sales/get-all-invoices-status-count`)
        .then((res) => {
          if (res.data && res.data.data) {
            setSalesStats({
              notInvoiced: res.data.data.notInvoiced || 0,
              due: res.data.data.due || 0,
              paid: res.data.data.paid || 0,
              cancelled: res.data.data.cancelled || 0,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching sales stats:", error);
          toast.error("Could not fetch sales statistics.");
        });
    }, [pagination.page, pagination.limit, debouncedSearchTerm, sortBy, sortOrder]);
  
    useEffect(() => {
      fetchSalesAndStats();
    }, [fetchSalesAndStats]);
  
    const handleSaleAdded = () => {
      setShowAddSale(false);
      fetchSalesAndStats(); // Refetch data
    };
    
    const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= pagination.totalPages) {
        setPagination(prev => ({ ...prev, page: newPage }));
      }
    };
  
    const handleSort = (field) => {
      if (sortBy === field) {
        if (field === 'totalAmountToBePaid') {
          setSortOrder(prev => prev === 'bigger' ? 'smaller' : 'bigger');
        } else {
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        }
      } else {
        setSortBy(field);
        if (field === 'totalAmountToBePaid') {
          setSortOrder('bigger');
        } else {
          setSortOrder('desc');
        }
      }
    };
  
    const formatDateForExport = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-GB");
    };
  
    const handleExport = async () => {
      const toastId = toast.loading("Exporting all sales data...");
      try {
        // Fetch all sales data with a large limit
        const response = await api.get(`/sales/sales-summary-table`, {
          params: { limit: 10000 }, // A large limit to fetch all data
        });
  
        if (response.data.success) {
          const allSales = response.data.data.sales;
          const formattedSales = allSales.map((sale) => ({
            Product: sale.product?.name,
            LC_Number: sale.lc?.number,
            Quantity: `${sale.quantity} ${sale.unit?.name || "N/A"}`,
            Unit_Price: sale.pricePerUnit,
            Total_Amount: sale.totalAmountToBePaid,
            Customer: sale.customer?.name,
            Invoice_Status: sale.invoiceStatus,
            Payment_Status: sale.paymentStatus,
            Sale_Date: formatDateForExport(sale.saleDate),
          }));
  
          const today = new Date().toISOString().split("T")[0];
          exportToExcel(
            formattedSales,
            `Sales_Report_${today}.xlsx`,
            `Sales Data ${today}`
          );
          toast.success("Sales Data Exported as XLSX", { id: toastId });
        } else {
          toast.error("Failed to fetch data for export.", { id: toastId });
        }
      } catch (error) {
        console.error("Error exporting sales data:", error);
        toast.error("Could not export sales data.", { id: toastId });
      }
    };
  
    return (
      <div>
        <div className="">
          <AddSalesForm
            isOpen={showAddSale}
            onClose={() => setShowAddSale(false)}
            onSaleAdded={handleSaleAdded}
          />
  
          {/* Header Section */}
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Sales Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage and track your product sales
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <Download className="w-4 h-4" />
                Export XLSX
              </button>
              <button
                onClick={() => setShowAddSale(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Plus className="w-4 h-4" />
                Add Sale
              </button>
            </div>
          </div>
  
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
  
          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Sales Records
                  </h2>
                  <p className="mt-1 text-sm text-gray-700">
                    Showing {salesData.length} of {pagination.totalSales} records
                  </p>
                </div>
                <SearchBar onSearch={setSearchTerm} placeholder="Search sales..."/>
              </div>
              <SalesTable 
                sales={salesData}
                isLoading={loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
              
              {/* Bottom Pagination */}
              {pagination.totalPages > 1 && (
                 <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                 <span className="text-sm text-gray-700">
                   Page {pagination.page} of {pagination.totalPages} ({pagination.totalSales} records)
                 </span>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => handlePageChange(pagination.page - 1)}
                     disabled={pagination.page <= 1}
                     className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                   <button
                     onClick={() => handlePageChange(pagination.page + 1)}
                     disabled={pagination.page >= pagination.totalPages}
                     className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </button>
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