import React from "react";
import { MapPin, Phone, ShoppingBag, DollarSign, Calendar } from "lucide-react";
import { Link } from "react-router";

const CustomerCard = ({ customer }) => {
  const totalPurchased = customer.totalSpent || 0;
  const totalDue = customer.totalDue || 0;
  const lastPurchaseDate = customer.lastPurchaseDate
    ? new Date(customer.lastPurchaseDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Never purchased";

  // Status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



  return (
    <Link to={`/customer-details/${customer._id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.99] h-full">
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
          
          <div className="flex flex-col gap-1 ml-2">
            {customer.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status}
              </span>
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
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-600">
                <ShoppingBag size={14} />
                <span className="text-xs font-medium">Total Purchased</span>
              </div>
              <p className="font-semibold text-gray-900 text-base">
                ${totalPurchased.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-red-600">
                <DollarSign size={14} />
                <span className="text-xs font-medium">Total Due</span>
              </div>
              <p className="font-semibold text-red-600 text-base">
                ${totalDue.toLocaleString()}
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
                Limit: ${customer.creditLimit?.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(CustomerCard);