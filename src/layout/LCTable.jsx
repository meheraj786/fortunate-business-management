// LCTable.jsx
import React from "react";
import { Link } from "react-router";
import { Grid2x2Check, Search, Filter, Plus } from "lucide-react";


const LCTable = ({
  lcData = [],
}) => {
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  // Blank state 
  if (!lcData || lcData.length === 0) {
    return (
      <div className="min-h-[400px] bg-white rounded-lg border-gray-200 p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search LC number, beneficiary, or products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors justify-center">
              <Filter size={20} />
              <span className="hidden sm:inline">Filter</span>
            </button>

          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-gray-500">
            <Grid2x2Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-base">No LC records found</p>
            <p className="text-sm mt-1">
              Start by adding your first Letter of Credit
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search LC number, beneficiary, or products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
          </div>

        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  LC Number
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Supplier
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Opening Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Due Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Products
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Total (BDT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {lcData.map((lc) => (
                <tr
                  key={lc._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                    <Link
                      to={`/lc-details/${lc._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {lc.lcNumber || lc.basicInfo?.lcNumber || "N/A"}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {lc.supplierName || lc.basicInfo?.supplierName || "N/A"}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        lc.status || lc.basicInfo?.status
                      )}`}
                    >
                      {lc.status || lc.basicInfo?.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
                    {new Date(
                      lc.lcOpeningDate || lc.basicInfo?.lcOpeningDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
                    {new Date(
                      lc.dueDate ||
                        lc.shippingCustomsInfo?.expectedArrivalDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                    {(lc.products || lc.productInfo)?.map(
                      (product, idx) => (
                        <div key={idx} className="mb-1 last:mb-0">
                          {product.itemName || "Unnamed"}
                        </div>
                      )
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-center">
                    {(() => {
                      const totalQuantity =
                        lc.products?.reduce(
                          (acc, item) => acc + (item.quantity || 0),
                          0
                        ) ||
                        lc.productInfo?.reduce(
                          (acc, item) => acc + (item.quantityValue || 0),
                          0
                        ) || 0;

                      const units = new Set();
                      (lc.products || lc.productInfo)?.forEach((p) => {
                        if (p.unit) units.add(p.unit);
                        if (p.quantityUnit?.name) units.add(p.quantityUnit.name);
                      });

                      const unitString = units.size === 1 ? ` ${Array.from(units)[0]}` : "";
                      return `${totalQuantity.toLocaleString()}${unitString}`;
                    })()}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap font-medium text-gray-900">
                    {(
                      lc.totalCost || lc.financialInfo?.lcAmountBdt || 0
                    )?.toLocaleString()}
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

export default LCTable;