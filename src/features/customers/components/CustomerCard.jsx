import React from "react";
import {
  MapPin,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getCustomerById } from "@/api/customer.api";
import StatusBadge from "@/components/ui/StatusBadge";
import CustomerTypePill from "@/components/ui/CustomerTypePill";

const CustomerCard = ({ customer }) => {
  const { hasPermission } = useAuth();
  const { formatCurrency, formatDate } = useSettings();
  const queryClient = useQueryClient();

  const prefetchCustomerDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["customers", id],
      queryFn: async () => (await getCustomerById(id)).data,
      staleTime: 5 * 60 * 1000,
    });
  };

  const canViewDetails = hasPermission("CUSTOMER_VIEW_DETAILS");

  const totalPurchased = customer.totalSpent || 0;
  const totalDue = customer.totalDue || 0;
  const creditBalance = customer.creditBalance || 0;
  const lastPurchaseDate = customer.lastPurchaseDate
    ? formatDate(customer.lastPurchaseDate)
    : "Never purchased";


  const CardContent = () => (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.99] h-full"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 1 }}
      onMouseEnter={() => prefetchCustomerDetails(customer._id)}
    >
      {/* Header with name and badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
            {customer.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 truncate">
            ID: {customer.customerId || customer._id?.slice(-6)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 ml-2 items-end">
          {customer.customerStatus && (
            <StatusBadge status={customer.customerStatus} size="sm" showIcon={false} />
          )}
          {customer.customerType && (
            <CustomerTypePill type={customer.customerType} />
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={14} className="flex-shrink-0 text-gray-400" />
          <span className="text-sm truncate">
            {customer.phone || "No phone"}
          </span>
        </div>
        {customer.billingAddress && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} className="flex-shrink-0 text-gray-400 mt-0.5" />
            <span className="text-sm line-clamp-2">
              {customer.billingAddress}
            </span>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="border-t border-gray-100 pt-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <ShoppingBag size={12} />
              <span className="text-xs font-medium">Purchased</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {formatCurrency(totalPurchased)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[var(--color-danger)]">
              <DollarSign size={12} />
              <span className="text-xs font-medium">Due</span>
            </div>
            <p className="font-semibold text-[var(--color-danger)] text-sm">
              {formatCurrency(totalDue)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[var(--color-primary)]">
              <Wallet size={12} />
              <span className="text-xs font-medium">Credit</span>
            </div>
            <p className="font-semibold text-[var(--color-primary)] text-sm">
              {formatCurrency(creditBalance)}
            </p>
          </div>
        </div>

        {/* Last Purchase and Credit Limit */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Last: {lastPurchaseDate}</span>
          </div>

          {customer.creditLimit > 0 && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              Limit: {formatCurrency(customer.creditLimit)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return canViewDetails ? (
    <Link to={`/customer-details/${customer._id}`} className="block">
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

export default React.memo(CustomerCard);
