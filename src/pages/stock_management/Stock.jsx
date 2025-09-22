import React, { useState } from "react";
import {
  Search,
  Plus,
  Package,
  Layers,
  Palette,
  Ruler,
  Warehouse,
  ChevronsDown,
  ChartColumnStacked,
} from "lucide-react";
import { products } from "../../data/data";
import ProductCard from "../../layout/ProductCard";
import StatBox from "../../layout/StatBox";

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Stock & Inventory
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                Manage your steel inventory and product catalog.
              </p>
            </div>
            <button className="bg-primary hover:bg-primary-hover text-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center text-sm sm:text-base">
              <Plus size={16} className="sm:hidden" />
              <Plus size={18} className="hidden sm:block md:hidden" />
              <Plus size={20} className="hidden md:block" />
              <span className="whitespace-nowrap">Add Product</span>
            </button>
          </div>

          <div className="my-4 sm:my-6 md:my-8 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <StatBox
              title={"Total Products"}
              number={products.length}
              Icon={Warehouse}
            />
            <StatBox
              title={"Low Stock"}
              number={
                products.filter((product) => product.quantity <= 10).length
              }
              Icon={ChevronsDown}
              textColor="red"
            />
            <StatBox
              title={"Categories"}
              number={categories.length - 1}
              Icon={ChartColumnStacked}
            />
            <StatBox
              title={"In Stock"}
              number={
                products.filter((product) => product.quantity > 50).length
              }
              Icon={Layers}
              textColor="green"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="sm:hidden absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Search
                size={18}
                className="hidden sm:block md:hidden absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Search
                size={20}
                className="hidden md:block absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0 sm:min-w-32"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <div className="text-gray-400 mb-2">
              <Package size={24} className="sm:hidden mx-auto" />
              <Package size={32} className="hidden sm:block md:hidden mx-auto" />
              <Package size={40} className="hidden md:block lg:hidden mx-auto" />
              <Package size={48} className="hidden lg:block mx-auto" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">
              No products found
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;