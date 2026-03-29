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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  Trash,
  Loader2,
} from "lucide-react";
import { useWarehouse } from "@/api/hooks/warehouse";
import { useProducts as useProductsFromProductHook } from "@/api/hooks/products";
import { useAuth } from "@/hooks/useAuth";

import ProductTableRow from "./components/ProductTableRow";
import StatBox from "@/components/ui/StatBox";
import AddProductForm from "./AddProductForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import { showErrorToast } from "@/utils/notifications";
import { useDebounce } from "@/hooks/useDebounce";



const SortIcon = ({ field, currentSort }) => {
  if (currentSort.sortBy !== field) {
    return <ArrowUpDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />;
  }
  return currentSort.sortOrder === "asc" ? (
    <ArrowUp size={12} className="text-[var(--color-primary)]" />
  ) : (
    <ArrowDown size={12} className="text-[var(--color-primary)]" />
  );
};

const stockStatusOptions = [
  { value: "", label: "All Stock Statuses" },
  { value: "OK", label: "OK" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "No Stock", label: "No Stock" },
];

const WarehouseStock = React.memo(() => {
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

  const handleSort = (field) => {
    if (sorting.sortBy === field) {
      setSorting((prev) => ({
        ...prev,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setSorting({ sortBy: field, sortOrder: "desc" });
    }
    setPage(1);
  };

  const isFiltered = filters.stockStatus !== "" || searchTerm !== "";

  const clearFilters = () => {
    setFilters({ stockStatus: "" });
    setSearchTerm("");
    setSorting({ sortBy: "createdAt", sortOrder: "desc" });
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
                {warehouseLoading ? (
                  <ValueSkeleton width="w-48" height="h-8" />
                ) : (
                  `${warehouse?.name} - Stock & Inventory`
                )}
              </h1>
              {warehouseLoading ? (
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <ValueSkeleton width="w-32" height="h-4" />
                </div>
              ) : (
                warehouse?.location && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm sm:text-base">
                    <MapPin size={16} /> <span>{warehouse.location}</span>
                  </div>
                )
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
              textColor="primary"
              loading={warehouseLoading}
            />
            <StatBox
              title="In Stock"
              number={warehouse?.stats?.totalInStock || 0}
              Icon={CheckCircle}
              textColor="success"
              loading={warehouseLoading}
            />
            <StatBox
              title="Low Stock"
              number={warehouse?.stats?.totalLowStock || 0}
              Icon={Box}
              textColor="warning"
              loading={warehouseLoading}
            />
            <StatBox
              title="Out of Stock"
              number={warehouse?.stats?.totalStockOut || 0}
              Icon={XCircle}
              textColor="danger"
              loading={warehouseLoading}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* TOOLBAR */}
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex flex-col xl:flex-row gap-3 xl:gap-4 items-start xl:items-center justify-between">
              <div className="flex-1 w-full sm:max-w-xs relative bg-gray-50 rounded-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 pr-3 py-2 bg-transparent border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-1 xl:pb-0 scrollbar-hide">
                {stockStatusOptions.map((option) => {
                  const isActive = filters.stockStatus === option.value;
                  const label = option.value === "" ? "All" : option.label;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange("stockStatus", option.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all border ${
                        isActive
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/20"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    title="Clear Filters"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] transition-colors flex-shrink-0 ml-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* TABLE BODY */}
            {productsLoading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 w-1/3 min-w-[160px] sm:min-w-[200px]">Product</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap sm:min-w-[100px]">Size</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap sm:min-w-[100px]">LC Number</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-right sm:min-w-[100px]">Unit Price</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-right sm:min-w-[110px]">Quantity</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-center sm:min-w-[90px]">Status</th>
                      <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap text-right w-8 sm:w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2">
                          <div className="flex flex-col gap-1.5">
                            <div className="h-4 bg-gray-200 rounded w-28 sm:w-48"></div>
                            <div className="h-3 bg-gray-100 rounded w-20 sm:w-32"></div>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-4 bg-gray-200 rounded w-12 sm:w-16"></div></td>
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-4 bg-gray-200 rounded w-16 sm:w-24"></div></td>
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-4 bg-gray-200 rounded w-14 sm:w-16 ml-auto"></div></td>
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-4 bg-gray-200 rounded w-16 sm:w-20 ml-auto"></div></td>
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2"><div className="h-5 bg-gray-200 rounded w-14 sm:w-16 mx-auto"></div></td>
                        <td className="px-2 py-1.5 sm:px-4 sm:py-2"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold select-none">
                        <th onClick={() => handleSort("name")} className="px-2 py-2 sm:px-4 sm:py-2.5 w-1/3 min-w-[160px] sm:min-w-[200px] cursor-pointer hover:bg-gray-100 transition-colors group">
                          <div className="flex items-center gap-1">
                            Product
                            <SortIcon field="name" currentSort={sorting} />
                          </div>
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap sm:min-w-[100px]">Size</th>
                        <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap sm:min-w-[100px]">LC Number</th>
                        <th onClick={() => handleSort("unitPrice")} className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors group sm:min-w-[100px]">
                          <div className="flex items-center justify-end gap-1">
                            Unit Price
                            <SortIcon field="unitPrice" currentSort={sorting} />
                          </div>
                        </th>
                        <th onClick={() => handleSort("quantity")} className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors group sm:min-w-[110px]">
                          <div className="flex items-center justify-end gap-1">
                            Quantity
                            <SortIcon field="quantity" currentSort={sorting} />
                          </div>
                        </th>
                        <th onClick={() => handleSort("stockStatus")} className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors group sm:min-w-[90px]">
                          <div className="flex items-center justify-center gap-1">
                            Status
                            <SortIcon field="stockStatus" currentSort={sorting} />
                          </div>
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap w-8 sm:w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <ProductTableRow
                          key={product._id}
                          product={product}
                          warehouseId={warehouseId}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  isLoading={productsLoading}
                  totalItems={totalProducts}
                  itemsPerPage={12}
                  className="p-4 border-t border-gray-200 bg-gray-50/50"
                />
              </>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2 font-medium">
                  {searchTerm || filters.stockStatus
                    ? "No products match criteria"
                    : "No products in warehouse"}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || filters.stockStatus
                    ? "Try adjusting search or clear filters"
                    : "Add your first product to get started"}
                </p>
              </div>
            )}
          </div>
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
});

export default WarehouseStock;
