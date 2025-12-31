import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router";
import {
  Search,
  Plus,
  Package,
  MapPin,
  CheckCircle,
  Box,
  XCircle,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown,
} from "lucide-react";

import ProductCard from "./components/ProductCard";
import StatBox from "@/components/ui/StatBox";
import AddProductForm from "./AddProductForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import api from "@/services/apiService";
import { handleError } from "@/utils/handle-error";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import Pagination from "@/components/ui/Pagination";

const sortOptions = [
  { value: "createdAt", label: "Creation Date" },
  { value: "name", label: "Name" },
  { value: "quantity", label: "Quantity" },
  { value: "unitPrice", label: "Unit Price" },
  { value: "updatedAt", label: "Last Updated" },
];

const stockStatusOptions = [
  { value: "", label: "All Stock Statuses" },
  { value: "OK", label: "OK" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "No Stock", label: "No Stock" },
];

const WarehouseStock = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();

  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState({
    warehouse: true,
    products: true,
  });
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    stockStatus: "",
  });
  const [sorting, setSorting] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const fetchWarehouseDetails = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, warehouse: true }));
      const response = await api.get(`/warehouse/${warehouseId}`);
      setWarehouse(response.data.data);
    } catch (err) {
      setError("Failed to load warehouse details");
      handleError(err, "Failed to load warehouse details");
    } finally {
      setLoading((prev) => ({ ...prev, warehouse: false }));
    }
  }, [warehouseId]);

  const fetchProducts = useCallback(async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const params = {
        page,
        limit: 12,
        search: debouncedSearchTerm,
        stockStatus: filters.stockStatus,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key];
        }
      });

      const res = await api.get(
        `/warehouse/${warehouseId}/products`,
        { params }
      );

      if (res.data?.success && res.data.data) {
        const { docs, totalPages, page, totalDocs } = res.data.data;
        setProducts(docs || []);
        setTotalPages(totalPages || 1);
        setPage(page || 1);
        setTotalProducts(totalDocs || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        handleError(res, "Failed to load products");
      }
    } catch (err) {
      setProducts([]);
      handleError(err, "Could not load products. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  }, [page, debouncedSearchTerm, filters, sorting, warehouseId]);

  useEffect(() => {
    if (!warehouseId) {
      navigate("/stock-management");
      return;
    }
    fetchWarehouseDetails();
  }, [warehouseId, navigate, fetchWarehouseDetails]);

  useEffect(() => {
    if (warehouseId) {
      fetchProducts();
    }
  }, [fetchProducts, warehouseId]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
    setPage(1);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSorting((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ stockStatus: "" });
    setSearchTerm("");
    setSorting({ sortBy: "createdAt", sortOrder: "desc" });
    setShowFilters(false);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const handleAddProductClick = () => setShowAddProductForm(true);
  const handleProductFormClose = () => setShowAddProductForm(false);

  const handleProductAddedOrUpdated = async () => {
    await Promise.all([fetchProducts(), fetchWarehouseDetails()]);
    handleProductFormClose();
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: "Stock", path: "/stock-management" },
      { label: warehouse?.name || "Loading..." },
    ],
    [warehouse?.name]
  );

  const isLoading = loading.warehouse || loading.products;
  if (loading.warehouse && !warehouse) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  if (error && !warehouse) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {warehouse?.name} - Stock & Inventory
              </h1>
              {warehouse?.location && (
                <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm sm:text-base">
                  <MapPin size={16} />
                  <span>{warehouse.location}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleAddProductClick}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          <div className="my-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title="Total Products"
              number={warehouse?.stats?.totalProducts || 0}
              Icon={Package}
              textColor="blue"
            />
            <StatBox
              title="In Stock"
              number={warehouse?.stats?.totalInStock || 0}
              Icon={CheckCircle}
              textColor="green"
            />
            <StatBox
              title="Low Stock"
              number={warehouse?.stats?.totalLowStock || 0}
              Icon={Box}
              textColor="orange"
            />
            <StatBox
              title="Out of Stock"
              number={warehouse?.stats?.totalStockOut || 0}
              Icon={XCircle}
              textColor="red"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or LC number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-full md:w-48">
                <select
                  value={sorting.sortBy}
                  onChange={handleSortByChange}
                  className="w-full appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base bg-white"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <button
                onClick={toggleSortOrder}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
              >
                {sorting.sortOrder === "asc" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {filters.stockStatus && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Filter Products
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Stock Status
                    </label>
                    <select
                      value={filters.stockStatus}
                      onChange={(e) =>
                        handleFilterChange("stockStatus", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      {stockStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  warehouseId={warehouseId}
                />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={loading.products}
              totalItems={totalProducts}
              itemsPerPage={12}
              className="mt-8 pt-6 border-t border-gray-200"
            />
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-200">
            <Package size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {searchTerm || filters.stockStatus
                ? "No products match your search"
                : "No products found"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm || filters.stockStatus
                ? "Try adjusting your search or filter criteria"
                : "Add your first product to get started"}
            </p>
          </div>
        )}
      </div>

      {showAddProductForm && (
        <AddProductForm
          isOpen={showAddProductForm}
          onClose={handleProductFormClose}
          onProductAdded={handleProductAddedOrUpdated}
          onProductUpdated={handleProductAddedOrUpdated}
          warehouse={warehouse}
        />
      )}
    </div>
  );
};

export default WarehouseStock;
