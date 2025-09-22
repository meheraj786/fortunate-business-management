import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Package,
  FileText,
  Check,
  X,
  Plus,
  DollarSign,
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { initialSalesData, products } from "../data/data";
import StatBox from "../layout/StatBox";

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterInvoice, setFilterInvoice] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [salesData, setSalesData] = useState(initialSalesData);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = [...new Set(products.map((item) => item.category))];

  const filteredData = useMemo(() => {
    let filtered = salesData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    if (filterInvoice !== "") {
      filtered = filtered.filter(
        (item) => item.invoiceStatus === filterInvoice
      );
    }

    const currentDate = new Date(selectedDate);
    if (dateFilter === "today") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === currentDate.toDateString();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo && itemDate <= currentDate;
      });
    } else if (dateFilter === "month") {
      const monthAgo = new Date(currentDate);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo && itemDate <= currentDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [searchTerm, filterCategory, filterInvoice, dateFilter, salesData, selectedDate]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSales = filteredData.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalProducts = filteredData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const invoiceCount = filteredData.filter(
    (item) => item.invoiceStatus === "yes"
  ).length;
  const pendingCount = filteredData.filter(
    (item) => item.invoiceStatus === "pending"
  ).length;

  const todaySales = salesData.filter((item) => {
    const itemDate = new Date(item.date);
    const today = new Date();
    return itemDate.toDateString() === today.toDateString();
  }).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...Object.values(data));
    const colors = [
      "#3B82F6",
      "#EF4444",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
    ];

    return (
      <div className="h-full flex items-end justify-around p-2 sm:p-4 bg-gray-50 rounded-lg overflow-x-auto">
        {Object.entries(data).map(([category, value], index) => (
          <div key={category} className="flex flex-col items-center space-y-1 sm:space-y-2 min-w-0">
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              ৳{(value / 1000).toFixed(0)}K
            </div>
            <div
              className="w-8 sm:w-12 rounded-t transition-all duration-300 hover:opacity-80"
              style={{
                height: `${Math.max((value / maxValue) * 150, 15)}px`,
                backgroundColor: colors[index % colors.length],
              }}
            ></div>
            <div className="text-xs text-gray-700 font-medium text-center max-w-12 sm:max-w-16 truncate">
              {category.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const FilterSection = ({ className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
        Filters
      </h3>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Product, LC, Customer..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none text-sm bg-transparent flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Status
          </label>
          <select
            value={filterInvoice}
            onChange={(e) => setFilterInvoice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="">All Status</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2">
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "week", label: "Last Week" },
              { key: "month", label: "Last Month" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  dateFilter === key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Steel Sales Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage and track your steel product sales
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none justify-center text-sm"
              >
                <Menu className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => setShowAddSale(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex-1 sm:flex-none justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Sale
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <StatBox
            title={"Total Sales"}
            number={`৳${totalSales.toLocaleString()}`}
            Icon={TrendingUp}
            textColor="green"
          />
          <StatBox
            title={"Today's Sales"}
            number={`৳${todaySales.toLocaleString()}`}
            Icon={DollarSign}
            textColor="blue"
          />
          <StatBox
            title={"Units Sold"}
            number={totalProducts}
            Icon={Package}
          />
            <StatBox
              title={"Invoiced"}
              number={invoiceCount}
              Icon={Check}
              textColor="green"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
              <div className="bg-white rounded-lg max-h-[80vh] overflow-y-auto w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <FilterSection />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSection />
          </div>

          {/* Chart */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                Sales by Category
              </h3>
              <div className="h-48 sm:h-64 md:h-80">
                {(() => {
                  const categoryData = {};
                  filteredData.forEach((item) => {
                    const total = item.price * item.quantity;
                    if (categoryData[item.category]) {
                      categoryData[item.category] += total;
                    } else {
                      categoryData[item.category] = total;
                    }
                  });

                  return Object.keys(categoryData).length > 0 ? (
                    <SimpleBarChart data={categoryData} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">No data available for chart</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Sales Records</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Showing {paginatedData.length} of {filteredData.length} records
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Table */}
          <div className="lg:hidden">
            {paginatedData.map((sale) => (
              <div key={sale.id} className="p-4 border-b border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {sale.productName}
                      </div>
                      <div className="text-xs text-gray-500">{sale.size}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 text-sm">
                        ৳{(sale.price * sale.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sale.quantity} {sale.unit}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{sale.customer}</span>
                    <span>{new Date(sale.date).toLocaleDateString("en-GB")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">{sale.lcNumber}</span>
                    {sale.invoiceStatus === "yes" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Yes
                      </span>
                    ) : sale.invoiceStatus === "no" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <X className="w-3 h-3 mr-1" />
                        No
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Calendar className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LC Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sale.productName}
                        </div>
                        <div className="text-sm text-gray-500">{sale.size}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.lcNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity} {sale.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ৳{sale.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ৳{(sale.price * sale.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.invoiceStatus === "yes" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Yes
                        </span>
                      ) : sale.invoiceStatus === "no" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" />
                          No
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Calendar className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500">
                <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No sales records found</p>
                <p className="text-xs sm:text-sm">Try adjusting your filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;