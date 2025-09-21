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

    const currentDate = new Date("2024-09-22");
    if (dateFilter === "week") {
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
  }, [searchTerm, filterCategory, filterInvoice, dateFilter, salesData]);

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
      <div className="h-full flex items-end justify-around p-4 bg-gray-50 rounded-lg">
        {Object.entries(data).map(([category, value], index) => (
          <div key={category} className="flex flex-col items-center space-y-2">
            <div className="text-xs text-gray-600 font-medium">
              ${(value / 1000).toFixed(1)}K
            </div>
            <div
              className="w-12 rounded-t transition-all duration-300 hover:opacity-80"
              style={{
                height: `${(value / maxValue) * 200}px`,
                backgroundColor: colors[index % colors.length],
                minHeight: "20px",
              }}
            ></div>
            <div className="text-xs text-gray-700 font-medium text-center max-w-16">
              {category.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className=" mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Steel Sales Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and track your steel product sales
              </p>
            </div>
            <button
              onClick={() => setShowAddSale(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Sale
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

          <StatBox
            title={"Total Sales"}
            number={totalSales.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
            Icon={TrendingUp}
            textColor="green"
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
          />
                    <StatBox
            title={"Pending"}
            number={pendingCount}
            Icon={Calendar}
            textColor="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              <div className="mb-4">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Status
                </label>
                <select
                  value={filterInvoice}
                  onChange={(e) => setFilterInvoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setDateFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateFilter === "all"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setDateFilter("week")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateFilter === "week"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => setDateFilter("month")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateFilter === "month"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Last Month
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
              <div className="h-80">
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
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No data available for chart</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Sales Records</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredData.length} of {salesData.length} records
            </p>
          </div>

          <div className="overflow-x-auto">
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
                {filteredData.map((sale) => (
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
                      ${sale.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(sale.price * sale.quantity).toFixed(2)}
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

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sales records found</p>
                  <p className="text-sm">Try adjusting your filters</p>
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
