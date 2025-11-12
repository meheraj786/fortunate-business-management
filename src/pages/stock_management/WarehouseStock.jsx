import React, {
  useContext,
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
  Layers,
  ChevronsDown,
  Archive,
} from "lucide-react";
import ProductCard from "../../layout/ProductCard";
import StatBox from "../../components/common/StatBox";
import AddProductForm from "./AddProductForm";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UrlContext } from "../../context/UrlContext";
import axios from "axios";
import toast from "react-hot-toast";

const WarehouseStock = () => {
  const { warehouseId } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [productsInWarehouse, setProductsInWarehouse] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    warehouse: true,
    products: true,
    stats: true,
  });
  const [error, setError] = useState(null);
  const { baseUrl } = useContext(UrlContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  // Memoized API calls
  const fetchWarehouseDetails = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, warehouse: true }));
      const response = await axios.get(`${baseUrl}warehouse/${warehouseId}`);
      setWarehouse(response.data.data);
    } catch (err) {
      console.error("Error fetching warehouse details:", err);
      setError("Failed to load warehouse details");
      toast.error("Failed to load warehouse details");
    } finally {
      setLoading((prev) => ({ ...prev, warehouse: false }));
    }
  }, [warehouseId, baseUrl]);

  const fetchProductsInWarehouse = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const response = await axios.get(
        `${baseUrl}warehouse/${warehouseId}/products`
      );
      setProductsInWarehouse(response.data.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  }, [warehouseId, baseUrl]);

  const fetchWarehouseStats = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));
      const response = await axios.get(
        `${baseUrl}warehouse/${warehouseId}/stats`
      );
      setStats(response.data.data);
    } catch (err) {
      console.error("Error fetching warehouse stats:", err);
      setError("Failed to load statistics");
      toast.error("Failed to load statistics");
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, [warehouseId, baseUrl]);

  // Fetch all data
  useEffect(() => {
    if (!warehouseId) {
      navigate("/stock-management");
      return;
    }

    const fetchData = async () => {
      setError(null);
      try {
        await Promise.all([
          fetchWarehouseDetails(),
          fetchProductsInWarehouse(),
          fetchWarehouseStats(),
        ]);
      } catch (err) {
        console.error("Error loading warehouse data:", err);
        setError("Failed to load warehouse data");
      }
    };

    fetchData();
  }, [
    warehouseId,
    baseUrl,
    navigate,
    fetchWarehouseDetails,
    fetchProductsInWarehouse,
    fetchWarehouseStats,
  ]);

  // Memoized data processing
  const uniqueCategories = useMemo(() => {
    const categories = productsInWarehouse
      .map((product) => product.category?.name)
      .filter(Boolean);
    return ["All", ...new Set(categories)];
  }, [productsInWarehouse]);

  const formatSize = useCallback((product) => {
    const parts = [];
    if (product.thickness) parts.push(`${product.thickness}mm`);
    if (product.width) parts.push(`${product.width}mm`);
    if (product.length) parts.push(`${product.length}mm`);
    return parts.join(" x ");
  }, []);

  const filteredProducts = useMemo(() => {
    return productsInWarehouse.filter((product) => {
      const sizeString = formatSize(product);
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.category?.name?.toLowerCase().includes(searchLower) ||
        (sizeString && sizeString.toLowerCase().includes(searchLower)) ||
        (product.color && product.color.toLowerCase().includes(searchLower));

      const matchesCategory =
        categoryFilter === "All" || product.category?.name === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [productsInWarehouse, searchTerm, categoryFilter, formatSize]);

  // Event handlers
  const handleAddProductClick = () => {
    setShowAddProductForm(true);
  };

  const handleProductFormClose = () => {
    setShowAddProductForm(false);
  };

  const handleProductAddedOrUpdated = async () => {
    try {
      await Promise.all([fetchProductsInWarehouse(), fetchWarehouseStats()]);
      handleProductFormClose();
      toast.success("Product updated successfully");
    } catch (err) {
      toast.error("Failed to update product data");
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: "Stock", path: "/stock-management" },
      { label: warehouse?.name || "Loading..." },
    ],
    [warehouse?.name]
  );

  const isLoading = loading.warehouse || loading.products || loading.stats;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
    <div className="min-h-screen p-4 sm:p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {warehouse?.name} - Stock & Inventory
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your steel inventory and product catalog.
              </p>
            </div>

            <button
              onClick={handleAddProductClick}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Statistics */}
          <div className="my-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title="Total Products"
              number={stats?.totalproductdocuments || 0}
              Icon={Package}
            />
            <StatBox
              title="Total In-stock"
              number={stats?.totalinstockproductcount || 0}
              Icon={Layers}
              textColor="green"
            />
            <StatBox
              title="Low Stock"
              number={stats?.totallowstockproductscount || 0}
              Icon={ChevronsDown}
              textColor="red"
            />
            <StatBox
              title="Stock Out"
              number={stats?.totalstockoutproductscount || 0}
              Icon={Archive}
              textColor="orange"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products by name, category, size, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              warehouseId={warehouseId}
              onUpdate={handleProductAddedOrUpdated}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading.products && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-2">
              <Package size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm || categoryFilter !== "All"
                ? "No products match your search"
                : "No products found"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm || categoryFilter !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Add your first product to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Add Product Form Modal */}
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
