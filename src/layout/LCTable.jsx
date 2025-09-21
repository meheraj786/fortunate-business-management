import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { lcData } from "../data/data";
import Input from "./Input";
import { Link } from "react-router";

const LCTable = () => {
  const getStatusColor = (status) => {
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
            <button className="bg-primary cursor-pointer hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Plus size={20} />
              Add LC
            </button>
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
          <div className="block sm:hidden">
            {lcData.map((lc) => (
              <Link to={`/lc-details/${lc.id}`}>
                <div
                  key={lc.id}
                  className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-900">
                      {lc.lcNumber}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        lc.status
                      )}`}
                    >
                      {lc.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Beneficiary:</span>
                      <span className="text-gray-900 text-right">
                        {lc.beneficiary}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Open Date:</span>
                      <span className="text-gray-900">{lc.openDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due Date:</span>
                      <span className="text-gray-900">{lc.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products:</span>
                      <span
                        className="text-gray-900 text-right max-w-40 truncate"
                        title={lc.products}
                      >
                        {lc.products}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="text-gray-900">{lc.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {lc.totalAmount}
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
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lcData.map((lc) => (
                  <tr
                    key={lc.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Link to={`/lc-details/${lc.id}`}>
                        <div className="font-medium text-gray-900">
                          {lc.lcNumber}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">{lc.beneficiary}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          lc.status
                        )}`}
                      >
                        {lc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{lc.openDate}</td>
                    <td className="py-4 px-6 text-gray-900">{lc.dueDate}</td>
                    <td className="py-4 px-6">
                      <div
                        className="text-gray-900 max-w-xs truncate"
                        title={lc.products}
                      >
                        {lc.products}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{lc.quantity}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {lc.totalAmount}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Total LCs
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {lcData.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 col-span-2 lg:col-span-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Total Value
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              $
              {lcData
                .reduce(
                  (sum, lc) =>
                    sum + parseFloat(lc.totalAmount.replace(/[$,]/g, "")),
                  0
                )
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCTable;
