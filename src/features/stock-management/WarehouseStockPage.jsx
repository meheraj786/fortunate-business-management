import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
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
  Trash,
  Loader2,
} from "lucide-react";
import { useWarehouse } from "@/api/hooks/warehouse";
import { useProducts as useProductsFromProductHook } from "@/api/hooks/products";
import { useAuth } from "@/hooks/useAuth";

import ProductCard from "./components/ProductCard";
import StatBox from "@/components/ui/StatBox";
import AddProductForm from "./AddProductForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { showErrorToast } from "@/utils/notifications";
import { useDebounce } from "@/hooks/useDebounce";

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
  const { hasPermission } = useAuth();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ stockStatus: "" });
  const [sorting, setSorting] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  useEffect(() => {
    if (!hasPermission("WAREHOUSE_VIEW")) {
      showErrorToast("You don't have permission to view warehouses.");
      navigate("/stock-management");
    }
  }, [hasPermission, navigate]);

  const {
    data: warehouseData,
    isLoading: warehouseLoading,
    isError: warehouseIsError,
    error: warehouseError,
    refetch: refetchWarehouse,
  } = useWarehouse(warehouseId);
  const warehouse = warehouseData?.data;

  const productParams = {
    page,
    limit: 12,
    search: debouncedSearchTerm,
    stockStatus: filters.stockStatus,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  };
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProductsFromProductHook(warehouseId, productParams);
  const {
    docs: products = [],
    totalPages = 1,
    totalDocs: totalProducts = 0,
  } = productsData?.data || {};

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSortByChange = (e) => {
    setSorting((prev) => ({ ...prev, sortBy: e.target.value }));
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSorting((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ stockStatus: "" });
    setSearchTerm("");
    setSorting({ sortBy: "createdAt", sortOrder: "desc" });
    setShowFilters(false);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleProductAddedOrUpdated = () => {
    refetchProducts();
    refetchWarehouse();
    setShowAddProductForm(false);
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: "Stock", path: "/stock-management" },
      { label: warehouse?.name || "Loading..." },
    ],
    [warehouse?.name],
  );

  if (warehouseLoading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  if (warehouseIsError) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <Package
            size={48}
            className="text-[var(--color-danger)] mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-[var(--color-danger)] mb-4">
            {warehouseError.message}
          </p>
          <Button
            onClick={() => navigate("/stock-management")}
            variant="primary"
            size="sm"
          >
            Back to Warehouses
          </Button>
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
                  <MapPin size={16} /> <span>{warehouse.location}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasPermission("PRODUCT_CREATE") && (
                <Button
                  onClick={() => setShowAddProductForm(true)}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Plus size={20} /> Add Product
                </Button>
              )}
              {hasPermission("TRASH_VIEW_PRODUCT") && (
                <Link to={`/trash/product?warehouseId=${warehouseId}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Trash className="text-[var(--color-danger)]" size={20} />{" "}
                    Product Trash
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="my-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title="Total Products"
              number={warehouse?.stats?.totalProducts || 0}
              Icon={Package}
              textColor="primary" // Changed from blue
            />
            <StatBox
              title="In Stock"
              number={warehouse?.stats?.totalInStock || 0}
              Icon={CheckCircle}
              textColor="success" // Changed from green
            />
            <StatBox
              title="Low Stock"
              number={warehouse?.stats?.totalLowStock || 0}
              Icon={Box}
              textColor="warning" // Changed from orange
            />
            <StatBox
              title="Out of Stock"
              number={warehouse?.stats?.totalStockOut || 0}
              Icon={XCircle}
              textColor="danger" // Changed from red
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <label htmlFor="search-product" className="sr-only">
                  Search by name or LC number
                </label>
                <input
                  id="search-product"
                  type="text"
                  placeholder="Search by name or LC number..."
                  className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-48">
                <select
                  value={sorting.sortBy}
                  onChange={handleSortByChange}
                  className="w-full appearance-none pl-3 pr-10 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm bg-white"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <Button
                onClick={toggleSortOrder}
                variant="secondary"
                size="sm"
                className="flex items-center justify-center gap-2 w-full md:w-auto"
              >
                {sorting.sortOrder === "asc" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                size="sm"
                className="flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Filter className="w-4 h-4" /> <span>Filters</span>
                {filters.stockStatus && (
                  <span className="w-2 h-2 bg-[var(--color-danger)] rounded-full"></span>
                )}
              </Button>
            </div>
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Filter Products
                  </h3>
                  <Button
                    onClick={clearFilters}
                    variant="subtle"
                    size="sm"
                    className="flex items-center gap-2 text-[var(--color-danger)] hover:text-[var(--color-danger)]"
                  >
                    <X className="w-4 h-4" /> Clear All Filters
                  </Button>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-base sm:text-sm"
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

        {productsLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
              >
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
              isLoading={productsLoading}
              totalItems={totalProducts}
              itemsPerPage={12}
              className="mt-8 pt-6 border-t border-gray-200"
            />
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
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
          onClose={() => setShowAddProductForm(false)}
          onProductAdded={handleProductAddedOrUpdated}
          onProductUpdated={handleProductAddedOrUpdated}
          warehouse={warehouse}
        />
      )}
    </div>
  );
};

export default WarehouseStock;
