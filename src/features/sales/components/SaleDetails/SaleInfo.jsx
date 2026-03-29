import React from "react";
import { Link } from "react-router";
import {
  Info,
  Package,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import StatusBadge from "@/components/ui/StatusBadge";

const SaleInfo = ({
  sale,
  loading = false,
  isOpeningBalance = false,
}) => {
  const { formatCurrency, formatNumber } = useSettings();
  return (
    <div className="space-y-6">
      {/* Sale Information */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
          {isOpeningBalance ? "Transaction Details" : "Sale Items"}
        </h2>

        {!isOpeningBalance ? (
          <div className="overflow-x-auto mb-6 border-gray-200 border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4">
                    <ValueSkeleton width="w-full" height="h-4" />
                  </td>
                </tr>
              ) : (sale?.items && sale.items.length > 0) ? (
                sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        {item.product?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatNumber(item.quantity)} {item.unit?.name || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(item.pricePerUnit)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.total || (item.quantity * item.pricePerUnit))}
                    </td>
                  </tr>
                ))
              ) : (
                // Legacy Single Product Fallback
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      {sale?.product?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatNumber(sale?.quantity)} {sale?.unit?.name || "units"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatCurrency(sale?.pricePerUnit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(sale?.totalAmount)}
                    {/* Note: totalAmount in legacy was inclusive of costs/charges potentially? 
                                    But usually quantity * price. The logic in backend totalAmount calculation before refactor included charges. 
                                    However, strictly for "Item Total", we should use quantity * price if available.
                                    But sale.totalAmount is the closest we have for the row if we treat the whole sale as 1 item.
                                */}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center">
            <Info className="h-6 w-6 text-[var(--color-primary)] mr-3 flex-shrink-0" />
            <p className="text-sm text-gray-800">
              This is an automated opening balance record created during customer onboarding or update. It represents the starting debt for this customer and does not contain related products.
            </p>
          </div>
        )}

        {/* Notes Section directly underneath Sale Items Table */}
        {(!loading && sale?.notes) && (
          <div className="mt-6 mb-6">
            <h3 className="block text-sm font-medium text-gray-600 mb-2">
              Additional Notes
            </h3>
            <p className="text-sm text-gray-800 bg-gray-50 p-3.5 rounded-md border border-gray-100 whitespace-pre-wrap">
              {sale.notes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Invoice Status
            </label>
            {loading ? (
              <ValueSkeleton width="w-20" height="h-5" />
            ) : (
              <StatusBadge status={sale?.invoiceStatus} size="sm" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Payment Status
            </label>
            {loading ? (
              <ValueSkeleton width="w-24" height="h-5" />
            ) : (
              <StatusBadge status={sale?.paymentStatus || "N/A"} size="sm" />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SaleInfo;
