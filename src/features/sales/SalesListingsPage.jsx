import React, { useState, useEffect } from "react";
import api from "@/services/apiService";
import SalesTable from "./components/SalesTable";
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

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
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
          setSales(sales);
          setPagination({ totalSales, page, limit, totalPages });
        } else {
          toast.error(response.data.message || `Failed to load ${title}`);
        }
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
        toast.error(error.response?.data?.message || `Could not fetch ${title}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
    initialFilters,
    title,
  ]);
  
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

  return (
    <div className="">
      <div className="mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            {title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{description}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by product, customer, or sale ID..."
            />
          </div>
          <div className="px-3 pb-3">
            <SalesTable 
              sales={sales} 
              isLoading={loading} 
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
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
  );
};

export default SalesListPage;
