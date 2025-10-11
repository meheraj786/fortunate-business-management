import React, { useState } from "react";
import {
  Package,
  Check,
  X,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { salesData as initialSalesData, products } from "../../data/data";
import AddSales from "./AddSales";

const getProductLcNumber = (productId) => {
  const product = products.find((p) => p.id === productId);
  return product ? product.lcNumber : "N/A";
};

const Sales = () => {
  const [salesData, setSalesData] = useState(initialSalesData);
  const [showAddSale, setShowAddSale] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = salesData.sort(
    (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
  );

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSaleAdded = (newSale) => {
    setSalesData([newSale, ...salesData]);
    setShowAddSale(false);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 ">
      <AddSales
        isOpen={showAddSale}
        onClose={() => setShowAddSale(false)}
        onSaleAdded={handleSaleAdded}
      />

      <div className=" mx-auto">
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
                onClick={() => setShowAddSale(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex-1 sm:flex-none justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Sale
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  Sales Records
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Showing {paginatedData.length} of {sortedData.length} records
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
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

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
                        ৳
                        {(
                          (parseFloat(sale.pricePerUnit) || 0) * sale.quantity
                        ).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sale.quantity} {sale.unit}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{sale.customerName}</span>
                    <span>
                      {new Date(sale.saleDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      {getProductLcNumber(sale.productId)}
                    </span>
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
                  <tr key={sale.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/sales/${sale.id}`}>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sale.productName}
                          </div>
                          <div className="text-sm text-gray-500">{sale.size}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getProductLcNumber(sale.productId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity} {sale.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ৳{parseFloat(sale.pricePerUnit || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ৳{(sale.pricePerUnit * sale.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customerName}
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
                      {new Date(sale.saleDate).toLocaleDateString("en-GB")}{" "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500">
                <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No sales records found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
