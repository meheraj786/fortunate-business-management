import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";

import Input from "./Input";
import { Link } from "react-router";
import { useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import { UrlContext } from "../context/UrlContext";

const LCTable = ({ lcData }) => {
  const { baseUrl } = useContext(UrlContext);
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

  console.log(lcData?.map((p) => p.product_info.map((pr) => pr.item_name)));

  const calculateTotalCost = (lc) => {
    const { financial_info, shipping_customs_info, agent_transport_info } = lc;
    if (!financial_info || !shipping_customs_info || !agent_transport_info) {
      return 0;
    }

    const financialOtherExpenses = financial_info.other_expenses?.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const shippingOtherExpenses = shipping_customs_info.other_expenses?.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const agentTransportOtherExpenses = agent_transport_info.other_expenses?.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );

    const customs_total_bdt =
      (shipping_customs_info.customs_duty_bdt || 0) +
      (shipping_customs_info.vat_bdt || 0) +
      (shipping_customs_info.ait_bdt || 0) +
      shippingOtherExpenses;

    const total_lc_cost_bdt =
      (financial_info.lc_amount_bdt || 0) +
      (financial_info.bank_charges_bdt || 0) +
      (financial_info.insurance_cost_bdt || 0) +
      financialOtherExpenses +
      customs_total_bdt +
      (agent_transport_info.cnf_agent_commission_bdt || 0) +
      (agent_transport_info.indenting_agent_commission_bdt || 0) +
      (agent_transport_info.transport_cost_bdt || 0) +
      agentTransportOtherExpenses;

    return total_lc_cost_bdt;
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
          <div className="block sm:hidden">
            {lcData?.map((lc) => (
              <Link to={`/lc-details/${lc._id}`} key={lc._id}>
                <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-900">
                      {lc.basic_info?.lc_number}
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        lc.basic_info?.status
                      )}`}
                    >
                      {lc.basic_info?.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Beneficiary:</span>
                      <span className="text-gray-900 text-right">
                        {lc.basic_info?.supplier_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Open Date:</span>
                      <span className="text-gray-900">
                        {new Date(
                          lc.basic_info?.lc_opening_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Due Date:</span>
                      <span className="text-gray-900">
                        {new Date(
                          lc.shipping_customs_info?.expected_arrival_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products:</span>
                      <div className="text-gray-900 text-right max-w-40 truncate">
                        {lc?.product_info.map((p, idx) => (
                          <span key={idx} title={p?.item_name}>
                            {p?.item_name} ({p?.quantity_ton} {p?.quantity_unit})
                            {idx < lc.product_info.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="text-gray-900">
                        {lc.product_info
                          ?.reduce((acc, item) => acc + item.quantity_ton, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Cost (BDT):</span>
                      <span className="font-semibold text-gray-900">
                        {calculateTotalCost(lc).toLocaleString()}
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
                          {lc.basic_info?.lc_number}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-900">
                        {lc.basic_info?.supplier_name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          lc.basic_info?.status
                        )}`}
                      >
                        {lc.basic_info?.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {new Date(lc.basic_info?.lc_opening_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {new Date(
                        lc.shipping_customs_info?.expected_arrival_date
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {lc?.product_info.map((p, idx) => (
                        <div
                          key={idx}
                          className="text-gray-900 max-w-xs truncate"
                          title={p?.item_name}
                        >
                          {p?.item_name} ({p?.quantity_ton} {p?.quantity_unit})
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-6 text-gray-900">
                      {lc.product_info
                        ?.reduce((acc, item) => acc + item.quantity_ton, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">
                        {calculateTotalCost(lc).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                .reduce((sum, lc) => {
                  return sum + calculateTotalCost(lc);
                }, 0)
                .toLocaleString()}
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LCTable;
