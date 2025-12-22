import React from "react";
import { Link } from "react-router";
import { Check, X, Calendar, Package, ArrowUp, ArrowDown } from "lucide-react";

const SalesTable = ({
  sales,
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const SortableHeader = ({ label, value }) => {
    const isSorted = sortBy === value;

    return (
      <th
        scope="col"
        className="px-2 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer sm:px-3 sm:text-sm"
        onClick={() => onSort(value)}
      >
        <div className="flex items-center gap-1 whitespace-nowrap">
          {label}
          {isSorted && (
            <span>
              {sortOrder === "desc" ? (
                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-2 py-4 sm:px-4">
        <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-20 sm:w-28"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-14 sm:w-20"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-16 sm:w-24"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
      </td>
      <td className="px-2 py-4 sm:px-3">
        <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
      </td>
    </tr>
  );

  if (!isLoading && (!sales || sales.length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium">No sales records found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-4 sm:text-sm"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  LC Number
                </th>
                <SortableHeader label="Quantity" value="quantity" />
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Unit Price
                </th>
                <SortableHeader label="Total" value="totalAmountToBePaid" />
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Invoice Status
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap sm:px-3 sm:text-sm"
                >
                  Payment Status
                </th>
                <SortableHeader label="Date" value="saleDate" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-900 sm:px-4 sm:text-sm">
                        <div
                          className="max-w-[100px] sm:max-w-[150px] truncate"
                          title={sale?.customer?.name}
                        >
                          {sale?.customer?.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
                        <Link
                          to={`/sales/${sale._id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          <div
                            className="max-w-[80px] sm:max-w-[120px] truncate"
                            title={sale?.product?.name}
                          >
                            {sale?.product?.name}
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-500 sm:px-3 sm:text-sm">
                        <div
                          className="max-w-[60px] sm:max-w-[80px] truncate"
                          title={sale?.lc?.number}
                        >
                          {sale?.lc?.number || "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-500 sm:px-3 sm:text-sm">
                        {sale.quantity} {sale?.unit?.name}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-500 sm:px-3 sm:text-sm">
                        ${sale.pricePerUnit}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs font-medium text-gray-900 sm:px-3 sm:text-sm">
                        $
                        {Math.floor(
                          sale.totalAmountToBePaid || 0
                        ).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
                        {sale.invoiceStatus === "Invoiced" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-2.5 h-2.5 mr-1 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Invoiced</span>
                            <span className="sm:hidden">Inv</span>
                          </span>
                        ) : sale.invoiceStatus === "Not-invoiced" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X className="w-2.5 h-2.5 mr-1 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">
                              Not Invoiced
                            </span>
                            <span className="sm:hidden">Not Inv</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Calendar className="w-2.5 h-2.5 mr-1 sm:w-3 sm:h-3" />
                            <div
                              className="max-w-[60px] truncate"
                              title={sale.invoiceStatus}
                            >
                              {sale.invoiceStatus}
                            </div>
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs sm:px-3 sm:text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            sale.paymentStatus === "Paid payment"
                              ? "bg-green-100 text-green-800"
                              : sale.paymentStatus === "Due payment"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div
                            className="max-w-[60px] truncate"
                            title={sale.paymentStatus}
                          >
                            {sale.paymentStatus}
                          </div>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-xs text-gray-500 sm:px-3 sm:text-sm">
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              }
                            )
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
