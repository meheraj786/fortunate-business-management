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

const SaleInfo = ({ sale, isRegisteredCustomer, hasPermission }) => {
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
              {sale.product?.name || "N/A"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Quantity
            </label>
            <p className="text-gray-900">
              {formatNumber(sale.quantity)} {sale.unit?.name || "units"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Unit Price
            </label>
            <p className="text-gray-900">{formatCurrency(sale.pricePerUnit)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Total Amount
            </label>
            <p className="text-gray-900">{formatCurrency(sale.totalAmount)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Invoice Status
            </label>
            <div className="flex items-center text-gray-900">
              <FileText className="h-4 w-4 mr-2 text-gray-400" />
              {sale.invoiceStatus}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Payment Status
            </label>
            <div className="flex items-center text-gray-900">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              {sale.paymentStatus || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      {sale.customer && (
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
            Customer Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <p className="text-gray-900">{sale.customer.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone
              </label>
              <p className="text-gray-900">{sale.customer.phone || "N/A"}</p>
            </div>
            {!isRegisteredCustomer && sale.customer.address && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Address
                </label>
                <p className="text-gray-900">{sale.customer.address}</p>
              </div>
            )}
            {isRegisteredCustomer && hasPermission("CUSTOMER_VIEW_DETAILS") && (
              <Link
                to={`/customer-details/${sale.customer.customerId._id}`}
                className="inline-flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
              >
                View Customer Details
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleInfo;
