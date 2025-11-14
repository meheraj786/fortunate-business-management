import React from "react";
import { Plus, Search, Filter, Grid2x2Check } from "lucide-react";

import { Link } from "react-router";
import { exportToExcel } from "../components/exportXlsx/ExportXlxs";
import toast from "react-hot-toast";

const LCTable = ({ lcData = [] }) => {
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExport = () => {
    const formattedData = lcData.map((lc) => ({
      LC_Number: lc.basicInfo?.lcNumber,
      Status: lc.basicInfo?.status,
      Supplier: lc.basicInfo?.supplierName,
      Opening_Date: new Date(lc.basicInfo?.lcOpeningDate).toLocaleDateString(),
      Arrival_Date: new Date(
        lc.shippingCustomsInfo?.expectedArrivalDate
      ).toLocaleDateString(),
      Products: lc.productInfo?.map((p) => p.itemName).join(", "),
      Total_Quantity: lc.productInfo?.reduce(
        (acc, item) => acc + item.quantityValue,
        0
      ),
      Total_Cost_BDT: lc.financialInfo?.lcAmountBdt,
    }));

    const today = new Date().toISOString().split("T")[0];

    exportToExcel(formattedData, `LC_Report_${today}.xlsx`, `LC Data ${today}`);
    toast.success("LC Table Exported As XLSX")
  };

  return (
    <div className="min-h-screen mt-10">
      <div className=" mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Letters of Credit
              </h1>
              <p className="text-gray-600 mt-1">
                Overview of all registered LCs within your organization.
              </p>
            </div>
            <Link to="/lc-form">
              <button className="bg-primary cursor-pointer hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Plus size={20} />
                Add LC
              </button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="my-6 flex justify-between items-center px-6 ">
            <h2 className="text-xl font-semibold">LC Table</h2>
            <button
              onClick={handleExport}
              className="px-4 py-2 flex justify-center items-center bg-green-600 gap-x-2 cursor-pointer text-white rounded-lg hover:bg-green-700"
            >
              <span>
                <Grid2x2Check size={20} />{" "}
              </span>
              <span>Export XLSX</span>
            </button>

          </div>
          <div className="block sm:hidden">
            {lcData?.map((lc) => (
              <Link to={`/lc-details/${lc._id}`} key={lc._id}>
                <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-900">
                      {lc.basicInfo.lcNumber}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        lc.basicInfo.status
                      )}`}
                    >
                      {lc.basicInfo.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Beneficiary:</span>
                      <span className="text-gray-900 text-right">
                        {lc.basicInfo.supplierName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Open Date:</span>
                      <span className="text-gray-900">
                        {new Date(
                          lc.basicInfo.lcOpeningDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due Date:</span>
                      <span className="text-gray-900">
                        {new Date(
                          lc.shippingCustomsInfo.expectedArrivalDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products:</span>
                      <div className="text-gray-900 text-right max-w-40 truncate">
                        {lc?.productInfo.map((p, idx) => (
                          <span key={idx} title={p?.itemName}>
                            {p?.itemName}{" "}
                            {idx < lc.productInfo.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="text-gray-900">
                        {lc.productInfo
                          ?.reduce((acc, item) => acc + item.quantityValue, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Cost (BDT):</span>
                      <span className="font-semibold text-gray-900">
                        {lc.financialInfo.lcAmountBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    LC Number
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Beneficiary
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Open Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Products
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Total Cost (BDT)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lcData.map((lc) => (
                  <tr
                    key={lc._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Link to={`/lc-details/${lc._id}`}>
                        <div className="font-medium text-gray-900">
                          {lc.basicInfo.lcNumber}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">
                        {lc.basicInfo.supplierName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          lc.basicInfo.status
                        )}`}
                      >
                        {lc.basicInfo.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {new Date(
                        lc.basicInfo.lcOpeningDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {new Date(
                        lc.shippingCustomsInfo.expectedArrivalDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {lc?.productInfo.map((p, idx) => (
                        <div
                          key={idx}
                          className="text-gray-900 max-w-xs truncate"
                          title={p?.itemName}
                        >
                          {p?.itemName} ({p?.quantityValue}{" "}
                          {p?.quantityUnit.name})
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {lc.productInfo
                        ?.reduce((acc, item) => acc + item.quantityValue, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {lc.financialInfo.lcAmountBdt.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCTable;
