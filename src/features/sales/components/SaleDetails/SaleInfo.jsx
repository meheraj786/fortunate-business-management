import React from "react";
import { Link } from "react-router";
import {
  Info,
  Package,
  FileText,
  DollarSign,
  User,
  ExternalLink,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const SaleInfo = ({
  sale,
  isRegisteredCustomer,
  hasPermission,
  loading = false,
}) => {
  const { formatCurrency, formatNumber } = useSettings();
  return (
    <div className="space-y-6">
      {/* Sale Information */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
          Sale Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Product
            </label>
            <div className="flex items-center text-gray-900">
              <Package className="h-4 w-4 mr-2 text-gray-400" />
              {loading ? (
                <ValueSkeleton width="w-32" height="h-4" />
              ) : (
                sale?.product?.name || "N/A"
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Quantity
            </label>
            {loading ? (
              <ValueSkeleton width="w-20" height="h-4" />
            ) : (
              `${formatNumber(sale?.quantity)} ${sale?.unit?.name || "units"}`
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Unit Price
            </label>
            <p className="text-gray-900">
              {loading ? (
                <ValueSkeleton width="w-20" height="h-4" />
              ) : (
                formatCurrency(sale?.pricePerUnit)
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Total Amount
            </label>
            <p className="text-gray-900">
              {loading ? (
                <ValueSkeleton width="w-24" height="h-4" />
              ) : (
                formatCurrency(sale?.totalAmount)
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Invoice Status
            </label>
            <div className="flex items-center text-gray-900">
              <FileText className="h-4 w-4 mr-2 text-gray-400" />
              {loading ? (
                <ValueSkeleton width="w-20" height="h-4" />
              ) : (
                sale?.invoiceStatus
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Payment Status
            </label>
            <div className="flex items-center text-gray-900">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              {loading ? (
                <ValueSkeleton width="w-24" height="h-4" />
              ) : (
                sale?.paymentStatus || "N/A"
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default SaleInfo;
