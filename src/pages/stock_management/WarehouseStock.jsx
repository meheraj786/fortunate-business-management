import React, { useState } from "react";
import { useParams } from "react-router";
import {
  Search,
  Plus,
  Package,
  Layers,
  ChevronsDown,
  ChartColumnStacked,
} from "lucide-react";
import { products, warehouses, categories } from "../../data/data";
import ProductCard from "../../layout/ProductCard";
import StatBox from "../../layout/StatBox";
import AddProductForm from "./AddProductForm";
import Breadcrumb from "../../components/common/Breadcrumb";

const WarehouseStock = () => {
  const { warehouseId } = useParams();
  const warehouse = warehouses.find((w) => w.id === parseInt(warehouseId));

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [productList, setProductList] = useState(
    products
      .filter((p) => p.warehouseId === parseInt(warehouseId))
      .map((p) => ({
        ...p,
        category: categories.find((c) => c.id === p.categoryId)?.name,
      }))
  );

  const handleProductAdded = (newProduct) => {
    const enrichedProduct = {
      ...newProduct,
      category: categories.find((c) => c.id === newProduct.categoryId)?.name,
    };
    setProductList([enrichedProduct, ...productList]);
    setShowAddProductForm(false);
  };

  const uniqueCategories = [
    "All",
    ...new Set(productList.map((product) => product.category)),
  ];

  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.size &&
        product.size.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.color &&
        product.color.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const breadcrumbItems = [
    { label: 'Stock', path: '/stock-management' },
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
              onClick={() => setShowAddProductForm(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
          <div className="my-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatBox
              title={"Total Products"}
              number={productList.length}
              Icon={Package}
            />
            <StatBox
              title={"Low Stock"}
              number={
                productList.filter((product) => product.quantity <= 10).length
              }
              Icon={ChevronsDown}
              textColor="red"
            />
            <StatBox
              title={"Categories"}
              number={uniqueCategories.length - 1}
              Icon={ChartColumnStacked}
            />
            <StatBox
              title={"In Stock"}
              number={
                productList.filter((product) => product.quantity > 50).length
              }
              Icon={Layers}
              textColor="green"
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
            <ProductCard key={product.id} product={product} />
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
          onClose={() => setShowAddProductForm(false)}
          onProductAdded={handleProductAdded}
          warehouseId={parseInt(warehouseId)}
        />
      )}
    </div>
  );
};

export default WarehouseStock;
