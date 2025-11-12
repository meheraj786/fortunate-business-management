import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Search,
  Plus,
  Package,
  Layers,
  Edit,
  ChevronsDown,
  ChartColumnStacked,
  Trash2,
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
  const { baseUrl } = useContext(UrlContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouseDetails();
    fetchProductsInWarehouse();
    fetchWarehouseStats();
  }, [warehouseId, baseUrl]);

  const fetchWarehouseDetails = () => {
    axios
      .get(`${baseUrl}warehouse/${warehouseId}`)
      .then((res) => setWarehouse(res.data.data));
  };

  const fetchProductsInWarehouse = () => {
    axios
      .get(`${baseUrl}warehouse/${warehouseId}/products`)
      .then((res) => setProductsInWarehouse(res.data.data));
  };

  const fetchWarehouseStats = () => {
    axios
      .get(`${baseUrl}warehouse/${warehouseId}/stats`)
      .then((res) => setStats(res.data.data));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const handleAddProductClick = () => {
    setShowAddProductForm(true);
  };

  const handleProductFormClose = () => {
    setShowAddProductForm(false);
  };

  const handleProductAddedOrUpdated = () => {
    fetchProductsInWarehouse();
    fetchWarehouseStats();
    handleProductFormClose();
  };

  const uniqueCategories = ["All", ...new Set(productsInWarehouse.map((product) => product.category?.name).filter(Boolean))];

  const formatSize = (product) => {
    const parts = [];
    if (product.thickness) parts.push(`${product.thickness}mm`);
    if (product.width) parts.push(`${product.width}mm`);
    if (product.length) parts.push(`${product.length}mm`);
    return parts.join(" x ");
  };

  const filteredProducts = productsInWarehouse.filter((product) => {
    const sizeString = formatSize(product);
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sizeString &&
        sizeString.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.color &&
        product.color.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "All" || product.category?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const breadcrumbItems = [
    { label: "Stock", path: "/stock-management" },
    { label: warehouse?.name },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto">
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
          <div className="my-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title={"Total Products"}
              number={stats?.totalproductdocuments || 0}
              Icon={Package}
            />
            <StatBox
              title={"Total In-stock"}
              number={stats?.totalinstockproductcount || 0}
              Icon={Layers}
              textColor="green"
            />
            <StatBox
              title={"Low Stock"}
              number={stats?.totallowstockproductscount || 0}
              Icon={ChevronsDown}
              textColor="red"
            />
            <StatBox
              title={"Stock Out"}
              number={stats?.totalstockoutproductscount || 0}
              Icon={Archive}
              textColor="orange"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="sm:hidden absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Search
                size={20}
                className="hidden sm:block absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products..."
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

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} warehouseId={warehouseId} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-2">
              <Package size={32} className="sm:hidden mx-auto" />
              <Package size={48} className="hidden sm:block mx-auto" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg">
              No products found
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Try adjusting your search or filter criteria
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
